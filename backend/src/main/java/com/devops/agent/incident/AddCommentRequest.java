package com.devops.agent.incident;

import jakarta.validation.constraints.NotBlank;

public record AddCommentRequest(
    @NotBlank(message = "Comment content cannot be blank")
    String content,
    boolean isInternal
) {}
