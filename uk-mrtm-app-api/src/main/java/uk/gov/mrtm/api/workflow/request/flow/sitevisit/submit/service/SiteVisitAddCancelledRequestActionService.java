package uk.gov.mrtm.api.workflow.request.flow.sitevisit.submit.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.gov.mrtm.api.workflow.request.core.domain.constants.MrtmRequestActionType;
import uk.gov.netz.api.workflow.request.core.domain.Request;
import uk.gov.netz.api.workflow.request.core.service.RequestService;

@Service
@RequiredArgsConstructor
public class SiteVisitAddCancelledRequestActionService {

	private final RequestService requestService;
	
	@Transactional
	public void add(final String requestId) {
		final Request request = requestService.findRequestById(requestId);

        requestService.addActionToRequest(request,
            null,
            MrtmRequestActionType.SITE_VISIT_APPLICATION_CANCELLED,
            request.getPayload().getOperatorAssignee());
	}
}
