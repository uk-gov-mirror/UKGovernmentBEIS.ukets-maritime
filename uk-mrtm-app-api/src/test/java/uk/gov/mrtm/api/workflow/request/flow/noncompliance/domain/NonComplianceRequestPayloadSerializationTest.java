package uk.gov.mrtm.api.workflow.request.flow.noncompliance.domain;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.NamedType;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestPayloadType;
import uk.gov.mrtm.api.workflow.request.flow.common.jsonprovider.RequestPayloadTypesProvider;
import uk.gov.netz.api.workflow.request.core.domain.RequestPayload;
import uk.gov.netz.api.workflow.request.flow.common.jsonprovider.RequestPayloadCommonTypesProvider;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class NonComplianceRequestPayloadSerializationTest {

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .configure(DeserializationFeature.FAIL_ON_MISSING_EXTERNAL_TYPE_ID_PROPERTY, false);

        objectMapper.registerSubtypes(
                new RequestPayloadCommonTypesProvider().getTypes().toArray(NamedType[]::new));
        objectMapper.registerSubtypes(
                new RequestPayloadTypesProvider().getTypes().toArray(NamedType[]::new));
    }

    @Test
    void shouldDeserializeNonComplianceRequestPayload() throws Exception {
        String json = """
            {
              "payloadType": "NON_COMPLIANCE_REQUEST_PAYLOAD",
              "reason": "FAILURE_TO_APPLY_FOR_AN_EMISSIONS_MONITORING_PLAN",
              "nonComplianceDate": "2025-01-15",
              "nonComplianceComments": "test comments"
            }
            """;

        RequestPayload deserialized = objectMapper.readValue(json, RequestPayload.class);

        assertThat(deserialized).isInstanceOf(NonComplianceRequestPayload.class);

        NonComplianceRequestPayload payload = (NonComplianceRequestPayload) deserialized;
        assertThat(payload.getPayloadType()).isEqualTo(MrtmRequestPayloadType.NON_COMPLIANCE_REQUEST_PAYLOAD);
        assertThat(payload.getReason()).isEqualTo(NonComplianceReason.FAILURE_TO_APPLY_FOR_AN_EMISSIONS_MONITORING_PLAN);
        assertThat(payload.getNonComplianceDate()).isEqualTo(LocalDate.of(2025, 1, 15));
        assertThat(payload.getNonComplianceComments()).isEqualTo("test comments");
    }
}
