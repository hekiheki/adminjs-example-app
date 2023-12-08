import { Box, Avatar, Text } from '@adminjs/design-system';
import { ReduxState } from 'adminjs';
import React, { FC } from 'react';
import { useSelector } from 'react-redux';

const TopBar: FC = () => {
  const session = useSelector((state: ReduxState) => state.session);
  const { username, nick, avatarUrl } = session;

  if (!session) return null;

  return (
    <Box flex flexGrow={1} justifyContent="end" alignItems="center">
      <Text ml="xl" mr="auto">
        {nick || username}
      </Text>
      <Avatar src={avatarUrl} alt={nick || username} mr="lg">
        {(nick || username).toUpperCase()}
      </Avatar>
    </Box>
  );
};

export { TopBar };
export default TopBar;
