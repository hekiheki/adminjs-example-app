import React from 'react';
import { BasePropertyProps, flat, useTranslation } from 'adminjs';
import { ValueGroup } from '@adminjs/design-system';
import ReferenceValue from './reference-value.js';

const ManyToManyShow: React.FC = (props: BasePropertyProps) => {
  const { property, record } = props;
  const items = flat.get(record.params, property.path) || [];
  const { translateProperty } = useTranslation();

  return (
    <ValueGroup label={translateProperty(property.label, property.resourceId)}>
      {(items || []).map((item, i) => {
        return <ReferenceValue key={i} {...props} record={item} property={property} />;
      })}
    </ValueGroup>
  );
};

export default ManyToManyShow;
