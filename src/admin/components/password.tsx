/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useState, memo, useEffect } from 'react';
import { Input, FormGroup, InputGroup, FormMessage, Button, Icon } from '@adminjs/design-system';
import { EditPropertyProps } from 'adminjs';
import PropertyLabel from './label.js';

const EditPassword: React.FC<EditPropertyProps> = (props) => {
  const { property, record, onChange } = props;
  const propValue = record.params[property.path];
  const [value, setValue] = useState(propValue);
  const error = record.errors && record.errors[property.path];
  const [isInput, setIsInput] = useState(false);

  // useEffect(() => {
  //   console.log(propValue);
  //   if (value !== propValue) {
  //     setValue(propValue);
  //   }
  // }, [propValue, value]);

  return (
    <FormGroup error={!!error}>
      <PropertyLabel property={property} />
      <InputGroup>
        <Input
          type={isInput ? 'input' : 'password'}
          className="input"
          id={property.path}
          name={property.path}
          onChange={(event) => setValue(event.target.value)}
          onBlur={() => onChange(property.path, value)}
          onKeyDown={(e) => e.keyCode === 13 && onChange(property.path, value)}
          value={value ?? ''}
          disabled={property.isDisabled}
          {...property.props}
        />
        <Button type="button" size="icon" onClick={() => setIsInput(!isInput)}>
          <Icon icon="Eye" />
        </Button>
      </InputGroup>
      {/* <InputGroup>
        <Input
          type={isInput ? 'input' : 'password'}
          className="input"
          id="newPassword"
          name="newPassword"
          onChange={(event) => setValue(event.target.value)}
          onBlur={() => onChange(property.path, value)}
          onKeyDown={(e) => e.keyCode === 13 && onChange(property.path, value)}
          value={value ?? ''}
          disabled={property.isDisabled}
          {...property.props}
        />
        <Button type="button" size="icon" onClick={() => setIsInput(!isInput)}>
          <Icon icon="Eye" />
        </Button>
      </InputGroup>
      <InputGroup>
        <Input
          type={isInput ? 'input' : 'password'}
          className="input"
          id="confirmPassword"
          name="confirmPassword"
          onChange={(event) => setValue(event.target.value)}
          onBlur={() => onChange(property.path, value)}
          onKeyDown={(e) => e.keyCode === 13 && onChange(property.path, value)}
          value={value ?? ''}
          disabled={property.isDisabled}
          {...property.props}
        />
        <Button type="button" size="icon" onClick={() => setIsInput(!isInput)}>
          <Icon icon="Eye" />
        </Button>
      </InputGroup> */}
      <FormMessage>{error && error.message}</FormMessage>
    </FormGroup>
  );
};

export default EditPassword;

// export default allowOverride(memo(Edit, recordPropertyIsEqual), 'DefaultPasswordEditProperty')