package uk.gov.mrtm.api.account.search.query;

import lombok.Getter;
import uk.gov.netz.api.account.search.query.AccountSearchResultRow;

/** QueryDSL projection row for MRTM account search. */
@Getter
public class MrtmAccountSearchResultRow extends AccountSearchResultRow {

    private final String imoNumber;

    public MrtmAccountSearchResultRow(
            Long id, String name, String businessId, String status, String imoNumber) {
        super(id, name, businessId, status);
        this.imoNumber = imoNumber;
    }
}
