import React from 'react';
import { Link } from 'react-router-dom';
import { ButtonCSS, Badge } from '@adminjs/design-system';
import { styled } from '@adminjs/design-system/styled-components';
import { ShowPropertyProps, ViewHelpers, useTranslation } from 'adminjs';

const StyledLink = styled<any>(Link)`
  ${ButtonCSS};
  padding-left: ${({ theme }) => theme.space.xs};
  padding-right: ${({ theme }) => theme.space.xs};
`;

type Props = Pick<ShowPropertyProps, 'property' | 'record'>;

const ReferenceValue: React.FC<Props> = (props) => {
  const { property, record } = props;
  const h = new ViewHelpers();
  const { translateProperty } = useTranslation();
  const refId = record.params[property.path];
  const populated = record.populated[property.path];
  const resourceId = property.reference;
  const value = (populated && translateProperty(populated.title, resourceId)) || translateProperty(refId, resourceId);

  if (!property.reference) {
    throw new Error(`property: "${property.path}" does not have a reference`);
  }

  if (!value) {
    return <></>;
  }

  if (populated && populated.recordActions.find((a) => a.name === 'show')) {
    const href = h.recordActionUrl({
      resourceId,
      recordId: refId,
      actionName: 'show',
    });
    return (
      <StyledLink variant="text" to={href}>
        {value}
      </StyledLink>
    );
  }
  return <Badge>{value}</Badge>;
};

export default ReferenceValue;
