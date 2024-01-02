import React from 'react';
import { ValueGroup } from '@adminjs/design-system';
import { useTranslation, ShowPropertyProps } from 'adminjs';

import ReferenceValue from './referenceValue.js';

const Show: React.FC<ShowPropertyProps> = (props) => {
  const { property, record } = props;
  const { translateProperty } = useTranslation();

  return (
    <ValueGroup label={translateProperty(property.label, property.resourceId)}>
      <ReferenceValue property={property} record={record} />
    </ValueGroup>
  );
};

export default Show;
