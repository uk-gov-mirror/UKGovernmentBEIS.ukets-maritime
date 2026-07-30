package uk.gov.mrtm.api.workflow.request.flow.aer.common.domain;

import lombok.Data;
import lombok.Getter;

import java.util.List;

@Data
public class AerViolation {

    private String sectionName;
    private String message;
    private Object[] data;

    public AerViolation(String sectionName, AerViolation.ViolationMessage violationMessage) {
        this(sectionName, violationMessage, List.of());
    }

    public AerViolation(String sectionName, AerViolation.ViolationMessage violationMessage,
                        Object... data) {
        this.sectionName = sectionName;
        this.message = violationMessage.getMessage();
        this.data = data;
    }

    @Getter
    public enum ViolationMessage {
        DUPLICATE_EMISSIONS_FUEL_NAME("AER contains multiple fuel records with the same name about the same ship"),
        DUPLICATE_EMISSIONS_SOURCE_NAME("AER contains multiple emission sources with the same name about the same ship"),
        INVALID_EMISSIONS_SOURCES_POTENTIAL_FUEL_TYPE("Potential fuel types are not derived from fuels and emissions factors"),
        INVALID_EMISSIONS_SOURCES_UNCERTAINTY_METHODS("Uncertainty monitoring methods are not derived from emission sources monitoring methods"),
        INVALID_IMO_NUMBER("IMO number does not exist"),
        SHIP_NOT_FOUND_IN_LIST_OF_SHIPS("Ship IMO number does not exist in list of ships"),
        NEGATIVE_EMISSIONS_INPUT("Emissions input is negative"),
        NO_DIRECT_EMISSIONS_OR_FUEL_CONSUMPTIONS("Port does not contain direct emissions or fuel consumptions"),
        PORT_VISIT_INVALID_PORT_CODE("Port code is not correct"),
        PORT_VISIT_INVALID_PORT_COUNTRY("Port country is not correct"),
        ARRIVAL_YEAR_MISMATCH_AER_YEAR("Port arrival year is not the same as AER year"),
        DEPARTURE_YEAR_MISMATCH_AER_YEAR("Port departure year is not the same as AER year"),
        OVERLAPPING_VISIT_FOUND("Ports overlapping visit found"),
        OVERLAPPING_VOYAGES_FOUND("Voyages overlapping voyage found"),
        PORTS_FUEL_CONSUMPTION_METHANE_SLIP_OR_NAME_MISMATCH("Port ports fuel consumption methane slip or name mismatch"),
        SHIP_DETAILS_INVALID_YEAR("Ship details year is not the same as AER year"),
        AGGREGATED_DATA_FETCHED_SHIP_NOT_FOUND_IN_PORTS_OR_VOYAGES("Aggregated data fetched ship not found in ports or voyages"),
        INVALID_FUEL_CONSUMPTION("Invalid fuel consumption that does not exist in list of ships"),
        DUPLICATE_FUEL_ENTRIES("Duplicate fuel entries found"),
        NO_VERIFICATION_REPORT_FOUND("No verification report found"),
        VERIFICATION_REPORT_INVALID_UNCORRECTED_NON_CONFORMITIES_REFERENCE("Uncorrected non conformities reference format is not valid"),
        VERIFICATION_REPORT_INVALID_PRIOR_YEAR_ISSUE_REFERENCE("Prior year issue reference format is not valid"),
        VERIFICATION_INVALID_RECOMMENDED_IMPROVEMENT_REFERENCE("Recommended Improvement reference format is not valid"),
        VERIFICATION_REPORT_INVALID_UNCORRECTED_NON_COMPLIANCES_REFERENCE("Uncorrected non compliances reference format is not valid"),
        VERIFICATION_REPORT_INVALID_UNCORRECTED_MISSTATEMENT_REFERENCE("Uncorrected misstatements reference format is not valid"),
        FUEL_NOT_ASSOCIATED_WITH_EMISSION_SOURCES("AER fuel type not associated with any emission source"),
        VERIFICATION_REPORT_INVALID_ERC_VERIFICATION_AND_SMF_EXISTS_COMBINATION("Emissions reduction claim verification and smf exist properties are not mutually valid"),
        ;

        private final String message;

        ViolationMessage(String message) {
            this.message = message;
        }
    }
}
