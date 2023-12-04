import { Box, Text } from '@adminjs/design-system';
import { ReduxState } from 'adminjs';
import React, { FC } from 'react';
import { useSelector } from 'react-redux';

const TopBar: FC = () => {
  const versions = useSelector((state: ReduxState) => state.versions);

  return (
    <Box flex flexGrow={1} justifyContent="end" alignItems="center">
      <Text ml="xl" mr="auto">
        {versions.admin}
      </Text>
    </Box>
  );
};

export { TopBar };
export default TopBar;
