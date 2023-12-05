import React from 'react';
import { BasePropertyProps, flat } from 'adminjs';
import ReferenceValue from './reference-value.js';

const ManyToManyList: React.FC = (props: BasePropertyProps) => {
  const { property, record } = props;
  const items = flat.get(record.params, property.path) || [];

  return (
    <>
      {(items || []).map((item, i) => {
        return <ReferenceValue key={i} {...props} record={item} property={property} />;
      })}
    </>
  );
};

export default ManyToManyList;
