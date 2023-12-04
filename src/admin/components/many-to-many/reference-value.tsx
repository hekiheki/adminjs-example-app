import React from 'react';
import { Badge } from '@adminjs/design-system';
import { PropertyJSON } from 'adminjs';

interface Props {
  property: PropertyJSON;
  record: any;
}

const ReferenceValue: React.FC<Props> = (props) => {
  const { record } = props;
  return (
    <Badge size="sm" rounded>
      {record.name}
    </Badge>
  );
};

export default ReferenceValue;
