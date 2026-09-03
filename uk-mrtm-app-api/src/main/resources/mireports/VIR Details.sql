/* VOS items */
with parameters as (select 2022 as reportingYear),
     aers_of_reporting_year as (select r.id                                   request_id,
                                       r.status,
                                       cast(r.metadata ->> 'year' as integer) reporting_year,
                                       r.metadata ->> 'exempted'              is_exempted
                                from request_account r
                                         join request_type rt on r.type_id = rt.id
                                where rt.code = 'AER'
                                  and cast(r.metadata ->> 'year' as integer) = (select reportingYear from parameters)),
     aer_submissions as (select r.request_id,
                                r.status,
                                r.reporting_year,
                                r.is_exempted,
                                ra.payload                                              aerData,
                                ra.type                                                 action_type,
                                ra.creation_date                                        action_creation_date,
                                max(ra.creation_date) over (partition by ra.request_id) max_action_creation_date
                         from aers_of_reporting_year r
                                  join request_action ra on ra.request_id = r.request_id
                         where ra.type in ('AER_APPLICATION_SUBMITTED', 'AER_APPLICATION_AMENDS_SUBMITTED',
                                           'AER_APPLICATION_VERIFICATION_SUBMITTED')),
     latest_aer_submission as (select request_id,
                                      status               aer_status,
                                      reporting_year,
                                      is_exempted,
                                      action_creation_date aer_submission_date,
                                      case action_type
                                          when 'AER_APPLICATION_VERIFICATION_SUBMITTED' then 'true'
                                          else aerData ->> 'verificationPerformed'
                                          end              verification_performed,
                                      aerData
                               from aer_submissions
                               where action_creation_date = max_action_creation_date),
     common as (select a.business_id      "Account Id",
                       a.name             "Account name",
                       am.imo_number      "IMO",
                       am.status          "Account status",
                       ars.status         "Reporting status",
                       aer.is_exempted    "Is Operator exempted",
                       p.id               "EMP Id",
                       aer.reporting_year "Reporting year",
                       aer.aerData
                from account a
                         join account_mrtm am on am.id = a.id
                         left join account_reporting_status ars on a.id = ars.account_id
                         left join emp p on p.account_id = a.id
                         join request_resource rr on (rr.resource_type = 'ACCOUNT' and rr.resource_id = a.id::VARCHAR)
                         join latest_aer_submission aer on aer.request_id = rr.request_id
                where verification_performed = 'true'
                  and (aer.aerData -> 'verificationReport' -> 'uncorrectedMisstatements' ->> 'exist' = 'true'
                    or aer.aerData -> 'verificationReport' -> 'uncorrectedNonConformities' ->>
                       'exist' = 'true'
                    or aer.aerData -> 'verificationReport' -> 'uncorrectedNonConformities' ->> 'existPriorYearIssues' =
                       'true'
                    or aer.aerData -> 'verificationReport' -> 'uncorrectedNonCompliances' ->> 'exist' = 'true'
                    or aer.aerData -> 'verificationReport' -> 'recommendedImprovements' ->> 'exist' = 'true'
                    )
                  and (ars.year = aer.reporting_year)),
     sectionVerifier as (select a.*, a.aerData -> 'verificationReport' -> 'verificationBodyDetails' ->> 'name' verifier
                         from common a),
     sectionLeadEtsAuditor as (select a.*,
                                      a.aerData -> 'verificationReport' -> 'verificationTeamDetails' ->>
                                      'leadEtsAuditor' leadEtsAuditor
                               from common a),
     sectionVerifierOpinion as (select a.*,
                                       a.aerData -> 'verificationReport' -> 'overallDecision' ->> 'type' verifierOpinion
                                from common a),
     sectionUncorrectedMisstatements as (select a.*, t.*
                                         from common a
                                                  cross join jsonb_to_recordset(a.aerData -> 'verificationReport' ->
                                                                                'uncorrectedMisstatements' ->
                                                                                'uncorrectedMisstatements')
                                             as t(reference varchar, explanation varchar)
                                         where a.aerData -> 'verificationReport' -> 'uncorrectedMisstatements' ->>
                                               'exist' = 'true'),
     sectionUncorrectedNonConformities as (select a.*, t.*
                                           from common a
                                                    cross join jsonb_to_recordset(a.aerData -> 'verificationReport' ->
                                                                                  'uncorrectedNonConformities' ->
                                                                                  'uncorrectedNonConformities')
                                               as t(reference varchar, explanation varchar)
                                           where a.aerData -> 'verificationReport' -> 'uncorrectedNonConformities' ->>
                                                 'existUncorrectedNonConformities' = 'true'),
     sectionUnresolvedPriorYearNonConformities as (select a.*, t.*
                                                   from common a
                                                            cross join jsonb_to_recordset(
                                                                       a.aerData -> 'verificationReport' ->
                                                                       'uncorrectedNonConformities' ->
                                                                       'priorYearIssues')
                                                       as t(reference varchar, explanation varchar)
                                                   where a.aerData -> 'verificationReport' ->
                                                         'uncorrectedNonConformities' ->> 'existPriorYearIssues' =
                                                         'true'),
     sectionUncorrectedNonCompliances as (select a.*, t.*
                                          from common a
                                                   cross join jsonb_to_recordset(a.aerData -> 'verificationReport' ->
                                                                                 'uncorrectedNonCompliances' ->
                                                                                 'uncorrectedNonCompliances')
                                              as t(reference varchar, explanation varchar)
                                          where a.aerData -> 'verificationReport' -> 'uncorrectedNonCompliances' ->>
                                                'exist' = 'true'),
     sectionRecommendedImprovements as (select a.*, t.*
                                        from common a
                                                 cross join jsonb_to_recordset(a.aerData -> 'verificationReport' ->
                                                                               'recommendedImprovements' ->
                                                                               'recommendedImprovements')
                                            as t(reference varchar, explanation varchar)
                                        where a.aerData -> 'verificationReport' -> 'recommendedImprovements' ->>
                                              'exist' = 'true')
select "Account Id",
       "Account name",
       "IMO",
       "Account status",
       "Reporting status",
       "Is Operator exempted",
       "EMP Id",
       "Reporting year",
       0                 "Section ID",
       'Account details' "Subtask Name",
       null              "Findings",
       null              "Details"
from common
union all
select "Account Id",
       "Account name",
       "IMO",
       "Account status",
       "Reporting status",
       "Is Operator exempted",
       "EMP Id",
       "Reporting year",
       1          "Section ID",
       'Verifier' "Subtask Name",
       null       "Findings",
       verifier   "Details"
from sectionVerifier
union all
select "Account Id",
       "Account name",
       "IMO",
       "Account status",
       "Reporting status",
       "Is Operator exempted",
       "EMP Id",
       "Reporting year",
       2                  "Section ID",
       'Lead ETS Auditor' "Subtask Name",
       null               "Findings",
       leadEtsAuditor     "Details"
from sectionLeadEtsAuditor
union all
select "Account Id",
       "Account name",
       "IMO",
       "Account status",
       "Reporting status",
       "Is Operator exempted",
       "EMP Id",
       "Reporting year",
       3                  "Section ID",
       'Verifier Opinion' "Subtask Name",
       null               "Findings",
       verifierOpinion    "Details"
from sectionVerifierOpinion
union all
select "Account Id",
       "Account name",
       "IMO",
       "Account status",
       "Reporting status",
       "Is Operator exempted",
       "EMP Id",
       "Reporting year",
       4                           "Section ID",
       'Uncorrected misstatements' "Subtask Name",
       reference                   "Findings",
       explanation                 "Details"
from sectionUncorrectedMisstatements
union all
select "Account Id",
       "Account name",
       "IMO",
       "Account status",
       "Reporting status",
       "Is Operator exempted",
       "EMP Id",
       "Reporting year",
       5                              "Section ID",
       'Uncorrected non-conformities' "Subtask Name",
       reference                      "Findings",
       explanation                    "Details"
from sectionUncorrectedNonConformities
union all
select "Account Id",
       "Account name",
       "IMO",
       "Account status",
       "Reporting status",
       "Is Operator exempted",
       "EMP Id",
       "Reporting year",
       6                                        "Section ID",
       'Unresolved prior year non-conformities' "Subtask Name",
       reference                                "Findings",
       explanation                              "Details"
from sectionUnresolvedPriorYearNonConformities
union all
select "Account Id",
       "Account name",
       "IMO",
       "Account status",
       "Reporting status",
       "Is Operator exempted",
       "EMP Id",
       "Reporting year",
       7                             "Section ID",
       'Uncorrected non-compliances' "Subtask Name",
       reference                     "Findings",
       explanation                   "Details"
from sectionUncorrectedNonCompliances
union all
select "Account Id",
       "Account name",
       "IMO",
       "Account status",
       "Reporting status",
       "Is Operator exempted",
       "EMP Id",
       "Reporting year",
       8                          "Section ID",
       'Recommended improvements' "Subtask Name",
       reference                  "Findings",
       explanation                "Details"
from sectionRecommendedImprovements
order by "EMP Id", "Section ID"