// user-roles-list.tsx

import React, { useState, useEffect } from 'react';
import { BasePropertyProps } from 'adminjs';
import { FormGroup, Label, Select } from '@adminjs/design-system';

const RolesList: React.FC = ({ record }: BasePropertyProps) => {
  const [roles, setRoles] = useState([]);

  return (
    <FormGroup>
      <Label htmlFor="userRoles">Roles</Label>
      <Select id="userRoles" name="userRoles" multiple>
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </Select>
    </FormGroup>
  );
};

export default RolesList;
