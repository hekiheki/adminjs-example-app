import { Box, Button, Text } from '@adminjs/design-system';
import { BasePropertyComponent, EditPropertyProps, useTranslation } from 'adminjs';
import React, { useEffect, useState } from 'react';

const PasswordEdit: React.FC<EditPropertyProps> = (props) => {
  const { onChange, property, record, resource } = props;
  const { translateButton: tb } = useTranslation();

  const [showPassword, togglePassword] = useState(false);

  useEffect(() => {
    if (!showPassword && property.name) {
      onChange(property.name, '');
    }
  }, [onChange, property.name, showPassword]);

  // For new records always show the property
  if (!record.id) {
    return <BasePropertyComponent.Password.Edit {...props} />;
  }

  // return null;
  return (
    <Box>
      {showPassword && <BasePropertyComponent.Password.Edit {...props} />}
      <Box mb="xl">
        <Text textAlign="center">
          <Button onClick={() => togglePassword(!showPassword)} type="button">
            {showPassword ? tb('cancel', resource.id) : tb('changePassword', resource.id)}
          </Button>
        </Text>
      </Box>
    </Box>
  );
};

export default PasswordEdit;
