import React from 'react';
import { Badge } from '@adminjs/design-system';
import { PropertyJSON, useTranslation } from 'adminjs';

interface Props {
  property: PropertyJSON;
  record: any;
}

const ReferenceValue: React.FC<Props> = (props) => {
  const { record, property } = props;
  const { translateProperty } = useTranslation();
  return (
    <Badge size="sm" rounded>
      {translateProperty(record.name, property.resourceId)}
    </Badge>
  );
};

export default ReferenceValue;
