import { Box, Icon, Tooltip, Label } from '@adminjs/design-system';
import React from 'react';
import { useTranslation, PropertyLabelProps, PropertyDescriptionProps } from 'adminjs';

const PropertyDescription: React.FC<PropertyDescriptionProps> = (props) => {
  const { property } = props;

  const { tm } = useTranslation();

  if (!property.description) {
    return null;
  }
  const direction = property.custom?.tooltipDirection || 'top';

  const translatedDescription = tm(property.description, property.resourceId);

  return (
    <Box mx="sm" display="inline-flex">
      <Tooltip direction={direction} title={translatedDescription} size="lg">
        <Box>
          <Icon icon="HelpCircle" color="info" />
        </Box>
      </Tooltip>
    </Box>
  );
};

const PropertyLabel: React.FC<PropertyLabelProps> = (props) => {
  const { property, props: labelProps, filter = false } = props;
  const { translateProperty } = useTranslation();

  if (property.hideLabel) {
    return null;
  }

  return (
    <Label
      htmlFor={filter ? ['filter', property.path].join('-') : property.path}
      required={!filter && property.isRequired}
      {...labelProps}
    >
      {translateProperty(property.label, property.resourceId)}
      {property.description && <PropertyDescription property={property} />}
    </Label>
  );
};

export default PropertyLabel;
