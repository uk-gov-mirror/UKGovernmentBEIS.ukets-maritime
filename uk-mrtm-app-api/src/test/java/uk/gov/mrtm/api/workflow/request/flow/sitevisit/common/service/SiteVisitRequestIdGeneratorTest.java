package uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestMetadataType;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestType;
import uk.gov.mrtm.api.workflow.request.flow.sitevisit.common.domain.SiteVisitRequestMetadata;
import uk.gov.netz.api.authorization.rules.domain.ResourceType;
import uk.gov.netz.api.workflow.request.core.domain.RequestSequence;
import uk.gov.netz.api.workflow.request.core.domain.RequestType;
import uk.gov.netz.api.workflow.request.core.repository.RequestSequenceRepository;
import uk.gov.netz.api.workflow.request.core.repository.RequestTypeRepository;
import uk.gov.netz.api.workflow.request.flow.common.domain.dto.RequestParams;

import java.time.Year;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SiteVisitRequestIdGeneratorTest {

    @InjectMocks
    private SiteVisitRequestIdGenerator generator;

    @Mock
    private RequestSequenceRepository requestSequenceRepository;
    @Mock
    private RequestTypeRepository requestTypeRepository;

    @Test
    void generate() {
        long currentSequence = 1;
        Long accountId = 1L;
        Year year = Year.of(2023);
        RequestParams params = RequestParams.builder()
            .requestResources(Map.of(ResourceType.ACCOUNT, accountId.toString()))
            .type(MrtmRequestType.SITE_VISIT)
            .requestMetadata(SiteVisitRequestMetadata.builder().type(MrtmRequestMetadataType.SITE_VISIT).year(year).build())
            .build();

        final RequestType requestType = RequestType.builder().code(MrtmRequestType.SITE_VISIT).build();
        String businessIdentifierKey = accountId + "-" + year.getValue();

        RequestSequence requestSequence = RequestSequence.builder()
            .id(2L)
            .businessIdentifier(businessIdentifierKey)
            .sequence(currentSequence)
            .requestType(requestType)
            .build();

        when(requestTypeRepository.findByCode(MrtmRequestType.SITE_VISIT)).thenReturn(Optional.of(requestType));
        when(requestSequenceRepository.findByBusinessIdentifierAndRequestType(businessIdentifierKey, requestType))
            .thenReturn(Optional.of(requestSequence));

        final String result = generator.generate(params);

        assertThat(result).isEqualTo("MASV" + "00001" + "-" + year + "-" + (currentSequence + 1));
        final ArgumentCaptor<RequestSequence> requestSequenceCaptor = ArgumentCaptor.forClass(RequestSequence.class);
        verify(requestSequenceRepository, times(1)).save(requestSequenceCaptor.capture());
        final RequestSequence requestSequenceCaptured = requestSequenceCaptor.getValue();
        assertThat(requestSequenceCaptured.getSequence()).isEqualTo(currentSequence + 1);
    }

    @Test
    void getTypes() {
        assertThat(generator.getTypes()).containsExactly(MrtmRequestType.SITE_VISIT);
    }

    @Test
    void getPrefix() {
        assertThat(generator.getPrefix()).isEqualTo("MASV");
    }
}
