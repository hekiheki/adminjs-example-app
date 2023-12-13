import { ValueGroup, Avatar, Icon } from '@adminjs/design-system';
import { useTranslation } from 'adminjs';
import type { BasePropertyProps } from 'adminjs';
import React, { FC } from 'react';

const Thumb: FC = (props: BasePropertyProps) => {
  const { record, property } = props;
  const value = record.params[property.name];
  const nick = record.params?.nick;
  const username = record.params?.username;

  const { translateProperty } = useTranslation();

  return (
    <ValueGroup label={translateProperty(property.label, property.resourceId)}>
      <Avatar src={value} alt={nick || username || 'avatar'} mr="lg">
        <Icon icon="User" />
      </Avatar>
    </ValueGroup>
  );
};

export default Thumb;
