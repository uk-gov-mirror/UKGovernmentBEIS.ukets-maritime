package uk.gov.mrtm.api.sitevisit.domain;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Type;
import uk.gov.netz.api.common.config.YearAttributeConverter;

import java.time.Year;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EqualsAndHashCode
@Entity
@Table(name = "site_visit")
public class SiteVisitEntity {

    @Id
    private String id;

    @EqualsAndHashCode.Include
    @Column(name = "account_id")
    @NotNull
    private Long accountId;

    @Column(name = "year")
    @Convert(converter = YearAttributeConverter.class)
    @NotNull
    private Year year;

    @Type(JsonType.class)
    @Column(name = "data", columnDefinition = "jsonb")
    @Valid
    @NotNull
    private SiteVisitContainer siteVisitContainer;
}
