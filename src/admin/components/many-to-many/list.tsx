import { RecordJSON, PropertyJSON, flat } from 'adminjs';
import React, { ReactNode } from 'react';
import ReferenceValue from './reference-value.js';

type Props = {
  property: PropertyJSON;
  record: RecordJSON;
  ItemComponent: typeof React.Component;
};

export default class ManyToManyList extends React.PureComponent<Props> {
  render(): ReactNode {
    const { property, record } = this.props;

    const items = flat.get(record.params, property.path) || [];

    return (
      <>
        {(items || []).map((item, i) => {
          return <ReferenceValue key={i} {...this.props} record={item} property={property} />;
        })}
      </>
    );
  }
}
