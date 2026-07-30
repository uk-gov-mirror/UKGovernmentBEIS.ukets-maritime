package uk.gov.mrtm.api.workflow.request.flow.empissuance.review.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uk.gov.mrtm.api.account.domain.MrtmAccount;
import uk.gov.mrtm.api.account.domain.dto.MrtmDocumentTemplateAccountData;
import uk.gov.mrtm.api.account.service.MrtmAccountQueryService;
import uk.gov.mrtm.api.common.domain.AddressState;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestPayloadType;
import uk.gov.mrtm.api.workflow.request.flow.common.service.MrtmAccountConstructAddressInfoService;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceAccountDraftData;
import uk.gov.mrtm.api.workflow.request.flow.empissuance.review.domain.EmpIssuanceApplicationReviewRequestTaskPayload;
import uk.gov.mrtm.api.workflow.request.flow.empvariation.domain.EmpVariationRequestPayload;
import uk.gov.netz.api.authorization.rules.domain.ResourceType;
import uk.gov.netz.api.competentauthority.CompetentAuthorityEnum;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.domain.RequestResource;
import uk.gov.netz.api.workflow.request.core.domain.RequestTask;
import uk.gov.netz.api.workflow.request.flow.common.domain.DecisionNotification;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MrtmDocumentTemplateAccountDataCollectFromEmpIssuanceServiceTest {

    @InjectMocks
    private MrtmDocumentTemplateAccountDataCollectFromEmpIssuanceService cut;

    @Mock
    private EmpIssuanceAccountDraftDataQueryService accountDraftDataQueryService;

    @Mock
    private MrtmAccountQueryService mrtmAccountQueryService;

    @Mock
    private MrtmAccountConstructAddressInfoService accountAddressService;

    @Test
    void collect() {
        Long accountId = 1L;
        final EmpVariationRequestPayload requestPayload = EmpVariationRequestPayload.builder()
            .payloadType(MrtmRequestPayloadType.EMP_VARIATION_REQUEST_PAYLOAD)
            .decisionNotification(DecisionNotification.builder()
                .build())
            .build();

        final Request request = Request.builder()
            .requestResources(List.of(RequestResource.builder().resourceId(String.valueOf(accountId)).resourceType(ResourceType.ACCOUNT).build(),
                RequestResource.builder().resourceId(CompetentAuthorityEnum.ENGLAND.name()).resourceType(ResourceType.CA).build()))
            .payload(requestPayload)
            .build();

        EmpIssuanceApplicationReviewRequestTaskPayload requestTaskPayload = EmpIssuanceApplicationReviewRequestTaskPayload.builder()
            .payloadType("sds")
            .build();

        RequestTask requestTask = RequestTask.builder()
            .request(request)
            .payload(requestTaskPayload)
            .build();

        MrtmAccount account = MrtmAccount.builder()
            .imoNumber("123")
            .build();

        EmpIssuanceAccountDraftData accountDraftData = EmpIssuanceAccountDraftData.builder()
            .name("name")
            .address(AddressState.builder()
                .city("city")
                .build())
            .build();

        String address = "Addres";

        when(mrtmAccountQueryService.getAccountById(accountId)).thenReturn(account);
        when(accountDraftDataQueryService.getAccountDraftData(requestTaskPayload)).thenReturn(accountDraftData);
        when(accountAddressService.constructAddressInfo(accountDraftData.getAddress())).thenReturn(address);

        var result = cut.collect(requestTask);

        assertThat(result).isEqualTo(MrtmDocumentTemplateAccountData.builder()
            .name(accountDraftData.getName())
            .competentAuthority(request.getCompetentAuthority())
            .imoNumber(account.getImoNumber())
            .address(address)
            .build());

        verify(mrtmAccountQueryService, times(1)).getAccountById(accountId);
        verify(accountDraftDataQueryService, times(1)).getAccountDraftData(requestTaskPayload);
        verify(accountAddressService, times(1)).constructAddressInfo(accountDraftData.getAddress());
    }
}