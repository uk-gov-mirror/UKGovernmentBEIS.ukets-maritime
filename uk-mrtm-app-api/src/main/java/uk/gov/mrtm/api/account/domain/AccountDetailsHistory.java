package uk.gov.mrtm.api.account.domain;

import com.fasterxml.jackson.databind.JsonNode;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;

@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Table(name = "account_details_history")
@Data
public class AccountDetailsHistory {

    @Id
    @SequenceGenerator(name = "account_details_history_id_generator", sequenceName = "account_details_history_seq",
            allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "account_details_history_id_generator")
    private Long id;

    @Column(name = "account_id")
    @NotNull
    private Long accountId;

    @Column(name = "submitter_id")
    private String submitterId;

    @NotNull
    @Column(name = "submitter_name")
    private String submitterName;

    @NotNull
    @Column(name = "creation_date")
    private LocalDateTime creationDate;

    @Type(JsonBinaryType.class)
    @NotNull
    @Column(columnDefinition = "jsonb", name = "previous_value")
    private JsonNode previousValue;

    @Type(JsonBinaryType.class)
    @NotNull
    @Column(columnDefinition = "jsonb", name = "new_value")
    private JsonNode newValue;

    @Column(name = "reason")
    private String reason;
}
