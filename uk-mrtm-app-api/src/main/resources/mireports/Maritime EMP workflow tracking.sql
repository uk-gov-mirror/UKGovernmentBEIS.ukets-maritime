with empRequests as (
    select r.id              request_id,
           r.status          request_status,
           r.submission_date,
           r.payload,
           r.account_id      account_id
      from request_account r
      join request_type rtype on rtype.id = r.type_id
     where rtype.code = 'EMP_ISSUANCE'
       and r.status <> 'CANCELLED'
),
operatorSubmitTasks as (
    select distinct on (rt.request_id)
           rt.request_id,
           rt.assignee,
           rt.start_date,
           rt.payload,
           rtt.code as task_type
      from request_task rt
      join request_task_type rtt on rtt.id = rt.type_id
      join empRequests er on er.request_id = rt.request_id
     where rtt.code in (
         'EMP_ISSUANCE_APPLICATION_SUBMIT',
         'EMP_ISSUANCE_APPLICATION_AMENDS_SUBMIT'
     )
     order by rt.request_id, rt.id desc
),
submitEvents as (
    select ra.request_id,
           max(ra.creation_date) as last_submission_date,
           (array_agg(ra.submitter_id order by ra.creation_date desc))[1] as last_submitter_id
      from request_action ra
      join empRequests er on er.request_id = ra.request_id
     where ra.type in (
         'EMP_ISSUANCE_APPLICATION_SUBMITTED',
         'EMP_ISSUANCE_APPLICATION_AMENDS_SUBMITTED'
     )
     group by ra.request_id
),
sectionKeys(key) as (
    values
        ('operatorDetails'),
        ('emissions'),
        ('sources'),
        ('greenhouseGas'),
        ('dataGaps'),
        ('mandate'),
        ('managementProcedures'),
        ('controlActivities'),
        ('abbreviations'),
        ('additionalDocuments')
),
bestSubmitSections as (
    select distinct on (ra.request_id)
           ra.request_id,
           ra.payload -> 'empSectionsCompleted' as emp_sections
      from request_action ra
      join empRequests er on er.request_id = ra.request_id
     where ra.type in (
         'EMP_ISSUANCE_APPLICATION_SUBMITTED',
         'EMP_ISSUANCE_APPLICATION_AMENDS_SUBMITTED'
     )
     order by ra.request_id,
              (
                  select count(*)::int
                    from sectionKeys sk
                   where upper(coalesce(ra.payload #>> array['empSectionsCompleted', sk.key], ''))
                         in ('COMPLETED', 'IN_PROGRESS', 'NEEDS_REVIEW')
              ) desc,
              ra.creation_date desc
),
sections as (
    select er.request_id,
           case
               when ost.task_type = 'EMP_ISSUANCE_APPLICATION_AMENDS_SUBMIT' then
                   coalesce(ost.payload -> 'empSectionsCompleted', '{}'::jsonb)
               when ost.request_id is not null then
                   coalesce(er.payload -> 'empSectionsCompleted', bss.emp_sections, '{}'::jsonb)
                   || coalesce(ost.payload -> 'empSectionsCompleted', '{}'::jsonb)
               else
                   coalesce(er.payload -> 'empSectionsCompleted', bss.emp_sections)
           end as emp_sections,
           case
               when ost.task_type = 'EMP_ISSUANCE_APPLICATION_AMENDS_SUBMIT' then 'COMPLETED'
               else 'NOT_STARTED'
           end as section_default
      from empRequests er
      left join operatorSubmitTasks ost on ost.request_id = er.request_id
      left join bestSubmitSections bss on bss.request_id = er.request_id
),
nestedNeedsReview as (
    select s.request_id,
           bool_or(kv.key = 'operatorDetails' or kv.key like 'operatorDetails-%') as operator_details,
           bool_or(kv.key = 'emissions' or kv.key like 'emissions-%' or kv.key like 'emissions-ship-%') as emissions,
           bool_or(kv.key = 'sources' or kv.key like 'sources-%' or kv.key like 'emission-sources%') as sources,
           bool_or(kv.key = 'greenhouseGas' or kv.key like 'greenhouseGas-%') as greenhouse_gas,
           bool_or(kv.key = 'dataGaps' or kv.key like 'dataGaps-%') as data_gaps,
           bool_or(kv.key = 'mandate' or kv.key like 'mandate-%') as mandate,
           bool_or(kv.key = 'managementProcedures' or kv.key like 'managementProcedures-%') as management_procedures,
           bool_or(kv.key = 'controlActivities' or kv.key like 'controlActivities-%') as control_activities,
           bool_or(kv.key = 'abbreviations' or kv.key like 'abbreviations-%') as abbreviations,
           bool_or(kv.key = 'additionalDocuments' or kv.key like 'additionalDocuments-%') as additional_documents
      from sections s
      left join lateral jsonb_each_text(coalesce(s.emp_sections, '{}'::jsonb)) kv on true
     where kv.value is not null
       and upper(kv.value) = 'NEEDS_REVIEW'
     group by s.request_id
)
select
      a.business_id                         "Account Id",
      a.name                                "Account name",
      am.imo_number                         "IMO",
      am.status                             "Account status",
      p.id                                  "EMP ID",
      er.request_id                         "Workflow ID",
      er.request_status                     "Workflow status",

      coalesce(
          ost.assignee,
          er.payload ->> 'operatorAssignee',
          se.last_submitter_id
      )                                     "Assignee user$userfullname",

      am.created_date::date                 "Account creation date",

      case
          when ost.request_id is not null then 'Inprogress'
          when se.last_submission_date is not null or er.submission_date is not null then 'Submitted'
          else 'Inprogress'
      end                                   "Status of application",

      se.last_submission_date::date         "Send to regulator",

      case
          when coalesce(nr.operator_details, false) then 'Needs review'
          else case coalesce(s.emp_sections ->> 'operatorDetails', s.section_default)
              when 'NOT_STARTED' then 'Not started yet'
              when 'IN_PROGRESS' then 'InProgress'
              when 'COMPLETED' then 'Completed'
              when 'NEEDS_REVIEW' then 'Needs review'
              when 'CANNOT_START_YET' then 'Cannot start yet'
              else coalesce(s.emp_sections ->> 'operatorDetails', 'Not started yet')
          end
      end                                   "Operator details",

      case
          when coalesce(nr.emissions, false) then 'Needs review'
          else case coalesce(s.emp_sections ->> 'emissions', s.section_default)
              when 'NOT_STARTED' then 'Not started yet'
              when 'IN_PROGRESS' then 'InProgress'
              when 'COMPLETED' then 'Completed'
              when 'NEEDS_REVIEW' then 'Needs review'
              when 'CANNOT_START_YET' then 'Cannot start yet'
              else coalesce(s.emp_sections ->> 'emissions', 'Not started yet')
          end
      end                                   "List of ships and calculation of maritime emissions",

      case
          when coalesce(nr.sources, false) then 'Needs review'
          else case coalesce(s.emp_sections ->> 'sources', s.section_default)
              when 'NOT_STARTED' then 'Not started yet'
              when 'IN_PROGRESS' then 'InProgress'
              when 'COMPLETED' then 'Completed'
              when 'NEEDS_REVIEW' then 'Needs review'
              when 'CANNOT_START_YET' then 'Cannot start yet'
              else coalesce(s.emp_sections ->> 'sources', 'Not started yet')
          end
      end                                   "Procedures for emissions sources and emission factors",

      case
          when coalesce(nr.greenhouse_gas, false) then 'Needs review'
          else case coalesce(s.emp_sections ->> 'greenhouseGas', s.section_default)
              when 'NOT_STARTED' then 'Not started yet'
              when 'IN_PROGRESS' then 'InProgress'
              when 'COMPLETED' then 'Completed'
              when 'NEEDS_REVIEW' then 'Needs review'
              when 'CANNOT_START_YET' then 'Cannot start yet'
              else coalesce(s.emp_sections ->> 'greenhouseGas', 'Not started yet')
          end
      end                                   "Procedures for monitoring greenhouse gas emissions and fuel consumption",

      case
          when coalesce(nr.data_gaps, false) then 'Needs review'
          else case coalesce(s.emp_sections ->> 'dataGaps', s.section_default)
              when 'NOT_STARTED' then 'Not started yet'
              when 'IN_PROGRESS' then 'InProgress'
              when 'COMPLETED' then 'Completed'
              when 'NEEDS_REVIEW' then 'Needs review'
              when 'CANNOT_START_YET' then 'Cannot start yet'
              else coalesce(s.emp_sections ->> 'dataGaps', 'Not started yet')
          end
      end                                   "Data gaps",

      case
          when coalesce(nr.mandate, false) then 'Needs review'
          else case coalesce(s.emp_sections ->> 'mandate', s.section_default)
              when 'NOT_STARTED' then 'Not started yet'
              when 'IN_PROGRESS' then 'InProgress'
              when 'COMPLETED' then 'Completed'
              when 'NEEDS_REVIEW' then 'Needs review'
              when 'CANNOT_START_YET' then 'Cannot start yet'
              else coalesce(s.emp_sections ->> 'mandate', 'Not started yet')
          end
      end                                   "Delegated responsibility",

      case
          when coalesce(nr.management_procedures, false) then 'Needs review'
          else case coalesce(s.emp_sections ->> 'managementProcedures', s.section_default)
              when 'NOT_STARTED' then 'Not started yet'
              when 'IN_PROGRESS' then 'InProgress'
              when 'COMPLETED' then 'Completed'
              when 'NEEDS_REVIEW' then 'Needs review'
              when 'CANNOT_START_YET' then 'Cannot start yet'
              else coalesce(s.emp_sections ->> 'managementProcedures', 'Not started yet')
          end
      end                                   "Management procedures",

      case
          when coalesce(nr.control_activities, false) then 'Needs review'
          else case coalesce(s.emp_sections ->> 'controlActivities', s.section_default)
              when 'NOT_STARTED' then 'Not started yet'
              when 'IN_PROGRESS' then 'InProgress'
              when 'COMPLETED' then 'Completed'
              when 'NEEDS_REVIEW' then 'Needs review'
              when 'CANNOT_START_YET' then 'Cannot start yet'
              else coalesce(s.emp_sections ->> 'controlActivities', 'Not started yet')
          end
      end                                   "Control activities",

      case
          when coalesce(nr.abbreviations, false) then 'Needs review'
          else case coalesce(s.emp_sections ->> 'abbreviations', s.section_default)
              when 'NOT_STARTED' then 'Not started yet'
              when 'IN_PROGRESS' then 'InProgress'
              when 'COMPLETED' then 'Completed'
              when 'NEEDS_REVIEW' then 'Needs review'
              when 'CANNOT_START_YET' then 'Cannot start yet'
              else coalesce(s.emp_sections ->> 'abbreviations', 'Not started yet')
          end
      end                                   "List of definitions and abbreviations",

      case
          when coalesce(nr.additional_documents, false) then 'Needs review'
          else case coalesce(s.emp_sections ->> 'additionalDocuments', s.section_default)
              when 'NOT_STARTED' then 'Not started yet'
              when 'IN_PROGRESS' then 'InProgress'
              when 'COMPLETED' then 'Completed'
              when 'NEEDS_REVIEW' then 'Needs review'
              when 'CANNOT_START_YET' then 'Cannot start yet'
              else coalesce(s.emp_sections ->> 'additionalDocuments', 'Not started yet')
          end
      end                                   "Additional information"

  from empRequests er
  join account a on a.id = cast(er.account_id as bigint)
  join account_mrtm am on am.id = a.id
  left join emp p on p.account_id = a.id
  left join operatorSubmitTasks ost on ost.request_id = er.request_id
  left join submitEvents se on se.request_id = er.request_id
  left join sections s on s.request_id = er.request_id
  left join nestedNeedsReview nr on nr.request_id = er.request_id
 where ost.request_id is not null
    or se.last_submission_date is not null
    or er.submission_date is not null
    or er.request_status = 'IN_PROGRESS'
 order by am.imo_number, er.request_id;
