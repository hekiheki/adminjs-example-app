import React from 'react';
import { BasePropertyProps, flat } from 'adminjs';
import { Box, Label } from '@adminjs/design-system';
import ReferenceValue from './reference-value.js';

const ManyToManyShow: React.FC = (props: BasePropertyProps) => {
  const { property, record } = props;
  const items = flat.get(record.params, property.path) || [];

  return (
    <Box>
      <Label>{property.label}</Label>
      {(items || []).map((item, i) => {
        return <ReferenceValue key={i} {...props} record={item} property={property} />;
      })}
    </Box>
  );
};

export default ManyToManyShow;
