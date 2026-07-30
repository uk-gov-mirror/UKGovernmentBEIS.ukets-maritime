WITH sectionOperatorDetails
AS (
SELECT a.id account_id, a.business_id "Account Id", a.name "Account name", am.imo_number "IMO", am.status "Account status", p.id "EMP ID",
CASE p.data -> 'emissionsMonitoringPlan' -> 'operatorDetails' -> 'organisationStructure' ->> 'legalStatusType'
WHEN 'LIMITED_COMPANY'
THEN 'Limited Company'
WHEN 'INDIVIDUAL'
THEN 'Individual'
WHEN 'PARTNERSHIP'
THEN 'Partnership'
ELSE p.data -> 'emissionsMonitoringPlan' -> 'operatorDetails' -> 'organisationStructure' ->> 'legalStatusType'
END legalStatus, p.data
FROM account a
JOIN account_mrtm am
ON am.id = a.id
LEFT
JOIN emp p
ON p.account_id = a.id
WHERE am.status = 'LIVE'
-- Uncomment the line below for filtering by company IMO number
-- AND (am.imo_Number = '3082184')
), shipEmissions
AS (
SELECT account_id, "details", "fuelsAndEmissionsFactors", "emissionsSources", "uncertaintyLevel", "carbonCapture", "measurements", "exemptionConditions"
FROM emp, jsonb_to_recordset(data -> 'emissionsMonitoringPlan' -> 'emissions' -> 'ships')
AS t("details" jsonb, "fuelsAndEmissionsFactors" jsonb, "emissionsSources" jsonb, "uncertaintyLevel" jsonb, "carbonCapture" jsonb, "measurements" jsonb, "exemptionConditions" jsonb)), shipDetailsSection
AS (
SELECT account_id, details ->> 'imoNumber' imoShip, details ->> 'name' name, details ->> 'type' type, details ->> 'grossTonnage' grossTonnage, details ->> 'flagState' flagState, details ->> 'iceClass' iceClass, details ->> 'natureOfReportingResponsibility' natureOfReportingResponsibility
FROM shipEmissions), fuelsEmissionsFactorsSection
AS (
SELECT account_id, "details" ->> 'imoNumber' imoShip, origin, type, name, "carbonDioxide", "methane", "nitrousOxide", "densityMethodBunker", "densityMethodTank"
FROM shipEmissions, jsonb_to_recordset("fuelsAndEmissionsFactors")
AS f("origin" varchar, "type" varchar, "name" varchar, "carbonDioxide" numeric, "methane" numeric, "nitrousOxide" numeric, "densityMethodBunker" varchar, "densityMethodTank" varchar)), emissionsSourcesSection
AS (
SELECT account_id, "referenceNumber", "details" ->> 'imoNumber' imoShip, s.name sourceName, s.type sourceType, "sourceClass", "methaneSlip", ( concat_ws('/', f.origin, f.type, f.name) )
AS fuelTypes,
    (string_agg(CASE e.value WHEN 'BDN' THEN 'Method A' WHEN 'BUNKER_TANK' THEN 'Method B' WHEN 'FLOW_METERS' THEN 'Method C' WHEN 'DIRECT' THEN 'Method D' ELSE e.value END, ', '))
AS monitoringMethod
FROM shipEmissions, jsonb_to_recordset("emissionsSources")
AS s("referenceNumber" varchar, "name" varchar, "type" varchar, "sourceClass" varchar, "fuelDetails" jsonb, "monitoringMethod" jsonb), jsonb_to_recordset("fuelDetails")
AS f("origin" varchar, "type" varchar, "name" varchar, "methaneSlip" numeric), jsonb_array_elements_text(s."monitoringMethod")
AS e(value)
GROUP BY s.name, "referenceNumber", "details" ->> 'imoNumber', account_id, s.type, "sourceClass", "methaneSlip", f.origin, f.type, f.name), uncertaintyLevelSection
AS (
SELECT account_id, "details" ->> 'imoNumber' imoShip, concat_ws(': ',
CASE "monitoringMethod"
WHEN 'BDN'
THEN 'Method A'
WHEN 'BUNKER_TANK'
THEN 'Method B'
WHEN 'FLOW_METERS'
THEN 'Method C'
WHEN 'DIRECT'
THEN 'Method D'
ELSE "monitoringMethod"
END, "methodApproach") monitoringMethodApproach, u.value monitoringMethodValue
FROM shipEmissions, jsonb_to_recordset("uncertaintyLevel")
AS u("monitoringMethod" varchar, "methodApproach" varchar, "value" numeric)), measurementsSection
AS (
SELECT account_id, "details" ->> 'imoNumber' imoShip, m.name, "technicalDescription", string_agg(e.value, ', ')
AS emissionSources
FROM shipEmissions, jsonb_to_recordset("measurements")
AS m("name" varchar, "technicalDescription" varchar, "emissionSources" jsonb), jsonb_array_elements_text(m."emissionSources")
AS e(value)
GROUP BY account_id, "details" ->> 'imoNumber', m.name, "technicalDescription"), carbonCaptureSection
AS (
SELECT account_id, "details" ->> 'imoNumber'
AS imoShip,
CASE "carbonCapture" ->> 'exist'
WHEN 'true'
THEN 'Yes'
ELSE 'No'
END
AS carbonCaptureExist, "carbonCapture" -> 'technologies' ->> 'description'
AS description, string_agg(distinct t.value, ', ')
AS technologyEmissionSources, string_agg(distinct f.value, ', ')
AS files
FROM shipEmissions
LEFT
JOIN lateral (
SELECT value
FROM jsonb_array_elements_text("carbonCapture" -> 'technologies' -> 'technologyEmissionSources') ) t(value)
ON "carbonCapture" ->> 'exist' = 'true'
LEFT
JOIN lateral (
SELECT value
FROM jsonb_array_elements_text("carbonCapture" -> 'technologies' -> 'files') ) f(value)
ON "carbonCapture" ->> 'exist' = 'true'
GROUP BY account_id, "details" ->> 'imoNumber', "carbonCapture" -> 'technologies' ->> 'description', "carbonCapture" ->> 'exist'), exemptionConditionsSection
AS (
SELECT account_id, "details" ->> 'imoNumber' imoShip,
CASE "exemptionConditions" ->> 'exist'
WHEN 'true'
THEN 'Yes'
ELSE 'No'
END exemptionConditionsExist, "exemptionConditions" ->> 'minVoyages' minVoyages
FROM shipEmissions)
SELECT "Account Id", "Account name", "IMO", "Account status", "EMP ID", o.legalStatus "Legal status", 0 sectionId, 'Account details' section, null "IMO Ship", null "Ship Name", null "Ship Type", cast(null
AS numeric) "Gross Tonage", null "Flag State", null "Ice class", null "Nature of reporting responsibility", null "Origin", null "Type", null "Name", cast(null
AS numeric) "Tank to Wake emission factor for carbon dioxide", cast(null
AS numeric) "Tank to Wake emission factor for methane", cast(null
AS numeric) "Tank to Wake emission factor for nitrous oxide", null "Method to determine density - fuel bunkered", null "Method to determine density - fuel in tanks", null "Emission source reference number", null "Unique emission source name", null "Emission source type", null "Emission source class", null "Potential fuel types used", cast(null
AS numeric) "Methane slip (%)", null "Monitoring Method", null "Approach used", cast(null
AS numeric) "Uncertainty value (%)", null "Name of measurement device", null "Technical description of measurement device", null "Emission source this device is used for", null "Are carbon capture and storage technologies being applied ?", null "Describe the technology used for carbon capture and storage", null "Emission source this technology is applied to", null "Uploaded files", null "Exemption of conditions exist", null "Minimum number of expected voyages during the reporting period"
FROM sectionOperatorDetails o
UNION ALL
SELECT "Account Id", "Account name", "IMO", "Account status", "EMP ID", o.legalStatus "Legal status", 1 sectionId, 'Ship details' section, imoShip "IMO Ship", name "Ship Name", type "Ship Type", cast(grossTonnage
AS numeric) "Gross Tonage", flagState "Flag State", iceClass "Ice class", natureOfReportingResponsibility "Nature of reporting responsibility", null "Origin", null "Type", null "Name", cast(null
AS numeric) "Tank to Wake emission factor for carbon dioxide", cast(null
AS numeric) "Tank to Wake emission factor for methane", cast(null
AS numeric) "Tank to Wake emission factor for nitrous oxide", null "Method to determine density - fuel bunkered", null "Method to determine density - fuel in tanks", null "Emission source reference number", null "Unique emission source name", null "Emission source type", null "Emission source class", null "Potential fuel types used", cast(null
AS numeric) "Methane slip (%)", null "Monitoring Method", null "Approach used", cast(null
AS numeric) "Uncertainty value (%)", null "Name of measurement device", null "Technical description of measurement device", null "Emission source this device is used for", null "Are carbon capture and storage technologies being applied ?", null "Describe the technology used for carbon capture and storage", null "Emission source this technology is applied to", null "Uploaded files", null "Exemption of conditions exist", null "Minimum number of expected voyages during the reporting period"
FROM sectionOperatorDetails o
JOIN shipDetailsSection d
ON o.account_id = d.account_id
UNION ALL
SELECT "Account Id", "Account name", "IMO", "Account status", "EMP ID", o.legalStatus "Legal status", 2 sectionId, 'Fuels and emission factors' section, imoShip "IMO Ship", null "Ship Name", null "Ship Type", cast(null
AS numeric) "Gross Tonage", null "Flag State", null "Ice class", null "Nature of reporting responsibility", origin "Origin", type "Type", name "Name", cast("carbonDioxide"
AS numeric) "Tank to Wake emission factor for carbon dioxide", cast(methane
AS numeric) "Tank to Wake emission factor for methane", cast("nitrousOxide"
AS numeric) "Tank to Wake emission factor for nitrous oxide", "densityMethodBunker" "Method to determine density - fuel bunkered", "densityMethodTank" "Method to determine density - fuel in tanks", null "Emission source reference number", null "Unique emission source name", null "Emission source type", null "Emission source class", null "Potential fuel types used", cast(null
AS numeric) "Methane slip (%)", null "Monitoring Method", null "Approach used", cast(null
AS numeric) "Uncertainty value (%)", null "Name of measurement device", null "Technical description of measurement device", null "Emission source this device is used for", null "Are carbon capture and storage technologies being applied ?", null "Describe the technology used for carbon capture and storage", null "Emission source this technology is applied to", null "Uploaded files", null "Exemption of conditions exist", null "Minimum number of expected voyages during the reporting period"
FROM sectionOperatorDetails o
JOIN fuelsEmissionsFactorsSection d
ON o.account_id = d.account_id
UNION ALL
SELECT "Account Id", "Account name", "IMO", "Account status", "EMP ID", o.legalStatus "Legal status", 3 sectionId, 'Emission sources' section, imoShip "IMO Ship", null "Ship Name", null "Ship Type", cast(null
AS numeric) "Gross Tonage", null "Flag State", null "Ice class", null "Nature of reporting responsibility", null "Origin", null "Type", null "Name", cast(null
AS numeric) "Tank to Wake emission factor for carbon dioxide", cast(null
AS numeric) "Tank to Wake emission factor for methane", cast(null
AS numeric) "Tank to Wake emission factor for nitrous oxide", null "Method to determine density - fuel bunkered", null "Method to determine density - fuel in tanks", "referenceNumber" "Emission source reference number", sourceName "Unique emission source name", sourceType "Emission source type", "sourceClass" "Emission source class", fuelTypes "Potential fuel types used", "methaneSlip" "Methane slip (%)", monitoringMethod "Monitoring Method", null "Approach used", cast(null
AS numeric) "Uncertainty value (%)", null "Name of measurement device", null "Technical description of measurement device", null "Emission source this device is used for", null "Are carbon capture and storage technologies being applied ?", null "Describe the technology used for carbon capture and storage", null "Emission source this technology is applied to", null "Uploaded files", null "Exemption of conditions exist", null "Minimum number of expected voyages during the reporting period"
FROM sectionOperatorDetails o
JOIN emissionsSourcesSection s
ON o.account_id = s.account_id
UNION ALL
SELECT "Account Id", "Account name", "IMO", "Account status", "EMP ID", o.legalStatus "Legal status", 4 sectionId, 'Uncertainty level' section, imoShip "IMO Ship", null "Ship Name", null "Ship Type", cast(null
AS numeric) "Gross Tonage", null "Flag State", null "Ice class", null "Nature of reporting responsibility", null "Origin", null "Type", null "Name", cast(null
AS numeric) "Tank to Wake emission factor for carbon dioxide", cast(null
AS numeric) "Tank to Wake emission factor for methane", cast(null
AS numeric) "Tank to Wake emission factor for nitrous oxide", null "Method to determine density - fuel bunkered", null "Method to determine density - fuel in tanks", null "Emission source reference number", null "Unique emission source name", null "Emission source type", null "Emission source class", null "Potential fuel types used", cast(null
AS numeric) "Methane slip (%)", null "Monitoring Method", monitoringMethodApproach "Approach used", monitoringMethodValue "Uncertainty value (%)", null "Name of measurement device", null "Technical description of measurement device", null "Emission source this device is used for", null "Are carbon capture and storage technologies being applied ?", null "Describe the technology used for carbon capture and storage", null "Emission source this technology is applied to", null "Uploaded files", null "Exemption of conditions exist", null "Minimum number of expected voyages during the reporting period"
FROM sectionOperatorDetails o
JOIN uncertaintyLevelSection s
ON o.account_id = s.account_id
UNION ALL
SELECT "Account Id", "Account name", "IMO", "Account status", "EMP ID", o.legalStatus "Legal status", 5 sectionId, 'Measurement' section, imoShip "IMO Ship", null "Ship Name", null "Ship Type", cast(null
AS numeric) "Gross Tonage", null "Flag State", null "Ice class", null "Nature of reporting responsibility", null "Origin", null "Type", null "Name", cast(null
AS numeric) "Tank to Wake emission factor for carbon dioxide", cast(null
AS numeric) "Tank to Wake emission factor for methane", cast(null
AS numeric) "Tank to Wake emission factor for nitrous oxide", null "Method to determine density - fuel bunkered", null "Method to determine density - fuel in tanks", null "Emission source reference number", null "Unique emission source name", null "Emission source type", null "Emission source class", null "Potential fuel types used", cast(null
AS numeric) "Methane slip (%)", null "Monitoring Method", null "Approach used", cast(null
AS numeric) "Uncertainty value (%)", s.name "Name of measurement device", "technicalDescription" "Technical description of measurement device", s.emissionSources "Emission source this device is used for", null "Are carbon capture and storage technologies being applied ?", null "Describe the technology used for carbon capture and storage", null "Emission source this technology is applied to", null "Uploaded files", null "Exemption of conditions exist", null "Minimum number of expected voyages during the reporting period"
FROM sectionOperatorDetails o
JOIN measurementsSection s
ON o.account_id = s.account_id
UNION ALL
SELECT "Account Id", "Account name", "IMO", "Account status", "EMP ID", o.legalStatus "Legal status", 6 sectionId, 'Carbon capture' section, imoShip "IMO Ship", null "Ship Name", null "Ship Type", cast(null
AS numeric) "Gross Tonage", null "Flag State", null "Ice class", null "Nature of reporting responsibility", null "Origin", null "Type", null "Name", cast(null
AS numeric) "Tank to Wake emission factor for carbon dioxide", cast(null
AS numeric) "Tank to Wake emission factor for methane", cast(null
AS numeric) "Tank to Wake emission factor for nitrous oxide", null "Method to determine density - fuel bunkered", null "Method to determine density - fuel in tanks", null "Emission source reference number", null "Unique emission source name", null "Emission source type", null "Emission source class", null "Potential fuel types used", cast(null
AS numeric) "Methane slip (%)", null "Monitoring Method", null "Approach used", cast(null
AS numeric) "Uncertainty value (%)", null "Name of measurement device", null "Technical description of measurement device", null "Emission source this device is used for", carbonCaptureExist "Are carbon capture and storage technologies being applied ?", description "Describe the technology used for carbon capture and storage", technologyEmissionSources "Emission source this technology is applied to", files "Uploaded files", null "Exemption of conditions exist", null "Minimum number of expected voyages during the reporting period"
FROM sectionOperatorDetails o
JOIN carbonCaptureSection s
ON o.account_id = s.account_id
UNION ALL
SELECT "Account Id", "Account name", "IMO", "Account status", "EMP ID", o.legalStatus "Legal status", 7 sectionId, 'Exemption of conditions' section, imoShip "IMO Ship", null "Ship Name", null "Ship Type", cast(null
AS numeric) "Gross Tonage", null "Flag State", null "Ice class", null "Nature of reporting responsibility", null "Origin", null "Type", null "Name", cast(null
AS numeric) "Tank to Wake emission factor for carbon dioxide", cast(null
AS numeric) "Tank to Wake emission factor for methane", cast(null
AS numeric) "Tank to Wake emission factor for nitrous oxide", null "Method to determine density - fuel bunkered", null "Method to determine density - fuel in tanks", null "Emission source reference number", null "Unique emission source name", null "Emission source type", null "Emission source class", null "Potential fuel types used", cast(null
AS numeric) "Methane slip (%)", null "Monitoring Method", null "Approach used", cast(null
AS numeric) "Uncertainty value (%)", null "Name of measurement device", null "Technical description of measurement device", null "Emission source this device is used for", null "Are carbon capture and storage technologies being applied ?", null "Describe the technology used for carbon capture and storage", null "Emission source this technology is applied to", null "Uploaded files", exemptionConditionsExist "Exemption of conditions exist", minVoyages "Minimum number of expected voyages during the reporting period"
FROM sectionOperatorDetails o
JOIN exemptionConditionsSection s
ON o.account_id = s.account_id;