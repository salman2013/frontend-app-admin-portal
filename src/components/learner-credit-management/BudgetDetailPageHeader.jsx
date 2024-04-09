import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Card, Skeleton, Stack } from '@edx/paragon';

import {
  useBudgetId,
  useSubsidyAccessPolicy,
  useBudgetDetailHeaderData,
  useEnterpriseOffer,
  useSubsidySummaryAnalyticsApi,
} from './data';
import BudgetDetailPageBreadcrumbs from './BudgetDetailPageBreadcrumbs';
import BudgetDetailPageOverviewAvailability from './BudgetDetailPageOverviewAvailability';
import BudgetDetailPageOverviewUtilization from './BudgetDetailPageOverviewUtilization';
import { BUDGET_TYPES } from '../EnterpriseApp/data/constants';
import BudgetStatusSubtitle from './BudgetStatusSubtitle';

const BudgetDetailPageHeader = ({ enterpriseUUID, enterpriseFeatures }) => {
  const { subsidyAccessPolicyId, enterpriseOfferId } = useBudgetId();
  const budgetType = (enterpriseOfferId !== null) ? BUDGET_TYPES.ecommerce : BUDGET_TYPES.policy;

  const { isLoading: isLoadingSubsidySummary, subsidySummary } = useSubsidySummaryAnalyticsApi(
    enterpriseUUID,
    enterpriseOfferId,
    budgetType,
  );

  const { isLoading: isLoadingEnterpriseOffer, data: enterpriseOfferMetadata } = useEnterpriseOffer(enterpriseOfferId);
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);

  const policyOrOfferId = subsidyAccessPolicyId || enterpriseOfferId;
  const {
    budgetId,
    budgetDisplayName,
    budgetTotalSummary,
    budgetAggregates,
    status,
    badgeVariant,
    term,
    date,
    isAssignable,
  } = useBudgetDetailHeaderData({
    subsidyAccessPolicy,
    subsidySummary,
    budgetId: policyOrOfferId,
    enterpriseOfferMetadata,
    isTopDownAssignmentEnabled: enterpriseFeatures.topDownAssignmentRealTimeLcm,
  });

  if (!subsidyAccessPolicy && (isLoadingSubsidySummary || isLoadingEnterpriseOffer)) {
    return (
      <div data-testid="budget-detail-skeleton">
        <Skeleton height={180} />
        <span className="sr-only">Loading budget header data</span>
      </div>
    );
  }

  return (
    <Stack gap={2}>
      <BudgetDetailPageBreadcrumbs budgetDisplayName={budgetDisplayName} />
      <Card className="budget-overview-card">
        <Card.Section>
          <h2>{budgetDisplayName}</h2>
          <BudgetStatusSubtitle
            badgeVariant={badgeVariant}
            status={status}
            isAssignable={isAssignable}
            term={term}
            date={date}
            policy={subsidyAccessPolicy}
          />
          <BudgetDetailPageOverviewAvailability
            enterpriseFeatures={enterpriseFeatures}
            budgetId={budgetId}
            budgetTotalSummary={budgetTotalSummary}
            isAssignable={isAssignable}
          />
          <BudgetDetailPageOverviewUtilization
            budgetId={budgetId}
            budgetTotalSummary={budgetTotalSummary}
            budgetAggregates={budgetAggregates}
            isAssignable={isAssignable}
          />
        </Card.Section>
      </Card>
    </Stack>
  );
};

const mapStateToProps = state => ({
  enterpriseUUID: state.portalConfiguration.enterpriseId,
  enterpriseFeatures: state.portalConfiguration.enterpriseFeatures,
});

BudgetDetailPageHeader.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  enterpriseFeatures: PropTypes.shape({
    topDownAssignmentRealTimeLcm: PropTypes.bool,
  }).isRequired,
};

export default connect(mapStateToProps)(BudgetDetailPageHeader);
