import React from 'react';
import { BasePropertyProps, useTranslation } from 'adminjs';
import { ValueGroup } from '@adminjs/design-system';
import ReferenceValue from './value.js';

const ReferenceValueShow: React.FC = (props: BasePropertyProps) => {
  const { property, record } = props;
  const { translateProperty } = useTranslation();

  return (
    <ValueGroup label={translateProperty(property.label, property.resourceId)}>
      <ReferenceValue {...props} record={record} property={property} />
    </ValueGroup>
  );
};

export default ReferenceValueShow;
