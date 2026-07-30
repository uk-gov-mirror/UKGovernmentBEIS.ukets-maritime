package uk.gov.mrtm.api.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import uk.gov.netz.api.common.exception.NetzErrorCode;

@Getter
public enum MrtmErrorCode implements NetzErrorCode {

    /** Codes for Account errors. */
    IMO_NUMBER_ALREADY_RELATED_WITH_ANOTHER_ACCOUNT("ACCOUNT1011", HttpStatus.BAD_REQUEST, "Enter a different company IMO number. This one is already in use."),
    ACCOUNT_REPORTING_STATUS_NOT_CHANGED("ACCOUNT1012", HttpStatus.BAD_REQUEST, "Enter a different reporting status."),
    FIRST_MARITIME_ACTIVITY_DATE_AFTER_PREVIOUS("ACCOUNT1013", HttpStatus.BAD_REQUEST, "The year of first maritime activity cannot be later than previously set"),

    /**Emissions Monitoring Plan error codes */
    INVALID_EMP("EMP1001", HttpStatus.BAD_REQUEST, "Invalid Emissions Monitoring Plan"),
    INVALID_EMP_REVIEW("EMP1002", HttpStatus.BAD_REQUEST, "Invalid Emissions Monitoring Plan review"),
    INVALID_EMP_VARIATION_REVIEW("EMP1004", HttpStatus.BAD_REQUEST, "Invalid Emissions Monitoring Plan variation review"),
    EMP_NOT_FOUND("EMP1005", HttpStatus.NOT_FOUND, "No emissions monitoring plan found"),
    
    EMP_CANNOT_PREVIEW_OFFICIAL_NOTICE("EMP1006", HttpStatus.NOT_FOUND, "Cannot preview official notice"),

    /**Emissions Monitoring Plan notification error codes */
    INVALID_EMP_NOTIFICATION("EMPNOTIFICATION1001", HttpStatus.BAD_REQUEST, "Invalid EMP notification"),

    EMP_BATCH_REISSUE_IN_PROGRESS_REQUEST_EXISTS("EMPBATCHREISSUE0001", HttpStatus.BAD_REQUEST, "In progress EMP batch reissue exists"),
    EMP_BATCH_REISSUE_ZERO_EMITTERS_SELECTED("EMPBATCHREISSUE0002", HttpStatus.BAD_REQUEST, "0 emitters selected"),
    EMP_REISSUE_ACCOUNT_NOT_APPLICABLE("EMPREISSUE1001", HttpStatus.BAD_REQUEST, "Invalid EMP reissue account"),

    /**
     * AER
     */
    AER_CREATION_NOT_ALLOWED_INVALID_ACCOUNT_STATUS("AER1000", HttpStatus.BAD_REQUEST, "AER creation is not allowed. Invalid account status"),
    AER_ALREADY_EXISTS_FOR_REPORTING_YEAR("AER1001", HttpStatus.BAD_REQUEST, "AER creation is not allowed. AER already exists for the provided reporting year"),
    AER_REQUEST_IS_NOT_AER("AER1002", HttpStatus.BAD_REQUEST, "Provided request id is not of type AER"),
    INVALID_AER("AER1004", HttpStatus.BAD_REQUEST, "Invalid AER"),
    INVALID_AER_VERIFICATION_REPORT("AER1005", HttpStatus.BAD_REQUEST, "Invalid AER verification report"),
    INVALID_AER_REVIEW("AER1006", HttpStatus.BAD_REQUEST, "Invalid AER review"),
    AER_NOT_FOUND("AER1007", HttpStatus.NOT_FOUND, "AER does not exist for specific year"),
    AER_IMPORT_EXTERNAL_DATA_NOT_ALLOWED("AER1008", HttpStatus.BAD_REQUEST, "Import of external data when reporting is not required is not allowed"),


    /** Codes for registry integration. */

    INTEGRATION_REGISTRY_ACCOUNT_CREATION_EMP_NOT_FOUND("INTREGACCOUNTCREATIONMRTM1006", HttpStatus.INTERNAL_SERVER_ERROR, "Cannot send emissions to ETS Registry because no emissions monitoring plan has been found"),
    INTEGRATION_REGISTRY_EMISSIONS_KAFKA_QUEUE_CONNECTION_ISSUE("INTREGACCOUNTCREATIONMRTM1007", HttpStatus.INTERNAL_SERVER_ERROR, "Cannot send emissions to ETS Registry because kafka message queue is not available"),
    INTEGRATION_REGISTRY_ACCOUNT_CREATION_REGISTRY_ID_EXISTS("INTREGACCOUNTCREATIONMRTM1008", HttpStatus.INTERNAL_SERVER_ERROR, "Cannot send emissions to ETS Registry because Operator Id already exists"),
    INTEGRATION_REGISTRY_EMISSIONS_AER_NOT_FOUND("INTREGEMISSIONSMRTM1006", HttpStatus.INTERNAL_SERVER_ERROR, "Cannot send emissions to ETS Registry because no aer request has been found"),
    INTEGRATION_REGISTRY_ACCOUNT_CONTACTS_INVALID_ROLE("INTREGACCOUNTCONTACTSMRTM1006", HttpStatus.INTERNAL_SERVER_ERROR, "Cannot send account contacts to ETS Registry because role type cannot be mapped to registry role type"),

    /**
     * VIR
     */
    INVALID_VIR("VIR1001", HttpStatus.BAD_REQUEST, "Invalid VIR"),
    VIR_CREATION_NOT_ALLOWED("VIR1000", HttpStatus.BAD_REQUEST, "VIR creation is not allowed"),
    INVALID_VIR_REVIEW("VIR1002", HttpStatus.BAD_REQUEST, "Invalid VIR review"),

    /**
     * Site Visit
     */
    INVALID_SITE_VISIT("SITEVISIT1001", HttpStatus.BAD_REQUEST, "Invalid Site Visit"),
    INVALID_SITE_VISIT_REVIEW("SITEVISIT1002", HttpStatus.BAD_REQUEST, "Invalid Site Visit review"),
    INVALID_SITE_VISIT_PEER_REVIEW("SITEVISIT1003", HttpStatus.BAD_REQUEST, "Site Visit cannot be sent for peer review"),
    ;

    /**
     * The error code.
     * */
    private final String code;

    /** The http status. */
    private final HttpStatus httpStatus;

    /** The message. */
    private final String message;

    MrtmErrorCode(String code, HttpStatus httpStatus, String message) {
        this.code = code;
        this.httpStatus = httpStatus;
        this.message = message;
    }
}
