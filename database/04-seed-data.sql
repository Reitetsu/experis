IF DB_ID(N'TaskManagementDb') IS NULL
BEGIN
    THROW 51000, 'TaskManagementDb does not exist. Run 01-create-database.sql first.', 1;
END;
GO

USE TaskManagementDb;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Tasks)
BEGIN
    INSERT INTO dbo.Tasks
    (
        Title,
        Description,
        Priority,
        Status,
        CreatedAt
    )
    VALUES
    (
        N'Review onboarding checklist',
        N'Check the pending onboarding items for the new analyst and confirm which tasks can start this week.',
        'Low',
        'Pending',
        '2026-06-01T08:00:00'
    ),
    (
        N'Prepare sprint scope',
        N'Draft the sprint scope for the mobile team and align the planned work with the current release objectives.',
        'Medium',
        'Pending',
        '2026-06-02T08:00:00'
    ),
    (
        N'Finalize executive presentation',
        N'Prepare the final version of the executive presentation, confirm the metrics with product and operations, and include a longer narrative section that can later help validate how a more extensive task description is rendered in the React Native detail screen without clipping or awkward layout behavior.',
        'High',
        'Pending',
        '2026-06-03T08:00:00'
    ),
    (
        N'Clean outdated backlog labels',
        N'Remove obsolete labels from the backlog and keep only the categories still used by the team.',
        'Low',
        'InProgress',
        '2026-06-04T08:00:00'
    ),
    (
        N'Update QA regression notes',
        N'Consolidate the current regression notes so QA can reuse the same checklist in the next verification cycle.',
        'Medium',
        'InProgress',
        '2026-06-05T08:00:00'
    ),
    (
        N'Coordinate production hotfix',
        N'Coordinate the hotfix rollout, confirm the deployment window and keep track of the validation steps after release.',
        'High',
        'InProgress',
        '2026-06-06T08:00:00'
    ),
    (
        N'Archive resolved support ticket',
        N'Close and archive the resolved support ticket after confirming there are no remaining follow-up actions.',
        'Low',
        'Completed',
        '2026-06-07T08:00:00'
    ),
    (
        N'Document release checklist',
        N'Document the release checklist used during the last delivery and store the final version for reuse.',
        'Medium',
        'Completed',
        '2026-06-08T08:00:00'
    ),
    (
        N'Publish weekly status summary',
        N'Publish the final weekly status summary to stakeholders and capture the completed milestones for reporting.',
        'High',
        'Completed',
        '2026-06-09T08:00:00'
    );

    PRINT N'Initial task data inserted.';
END;
ELSE
BEGIN
    PRINT N'Table dbo.Tasks already contains data. Seed skipped.';
END;
GO
