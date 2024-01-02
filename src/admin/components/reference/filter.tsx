import React, { useState } from 'react';
import { FormGroup, SelectAsync } from '@adminjs/design-system';
import { FilterPropertyProps, SelectRecord, ApiClient, useTranslation } from 'adminjs';

import PropertyLabel from '../propertyLabel.js';

type SelectOptions = Array<{ value: string | number; label: string }>;

const Filter: React.FC<FilterPropertyProps> = (props) => {
  const { property, filter, onChange } = props;
  const { reference: resourceId } = property;
  const [options, setOptions] = useState<SelectOptions>([]);
  const { translateProperty } = useTranslation();

  const api = new ApiClient();

  const handleChange = (selected: SelectRecord) => {
    onChange(property.path, selected ? selected.value : '');
  };

  const loadOptions = async (inputValue: string): Promise<SelectOptions> => {
    const records = await api.searchRecords({
      resourceId,
      query: inputValue,
    });

    const loadedOptions = records.map((r) => ({
      value: r.id,
      label: resourceId === 'user' ? r.title : translateProperty(r.title, resourceId),
    }));
    setOptions(loadedOptions);

    return loadedOptions;
  };

  const value = typeof filter[property.path] === 'undefined' ? '' : filter[property.path];
  const selected = (options || []).find((o) => String(o.value) === String(value));

  return (
    <FormGroup>
      <PropertyLabel property={property} filter={true} />
      <SelectAsync
        variant="filter"
        value={typeof selected === 'undefined' ? '' : selected}
        isClearable
        cacheOptions
        loadOptions={loadOptions}
        onChange={handleChange}
        defaultOptions
      />
    </FormGroup>
  );
};

export default Filter;
