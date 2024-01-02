import React, { FC, useState } from 'react';
import { FormGroup, FormMessage, SelectAsync } from '@adminjs/design-system';
import { ApiClient, EditPropertyProps, SelectRecord, RecordJSON, flat, useTranslation } from 'adminjs';

import PropertyLabel from '../propertyLabel.js';

type CombinedProps = EditPropertyProps;
type SelectRecordEnhanced = SelectRecord & {
  record: RecordJSON;
};

const Edit: FC<CombinedProps> = (props) => {
  const { onChange, property, record } = props;
  const { reference: resourceId } = property;
  const { translateProperty } = useTranslation();
  const selectedId = flat.get(record?.params, property.path);
  const api = new ApiClient();

  if (!resourceId) {
    throw new Error(`Cannot reference resource in property '${property.path}'`);
  }

  const handleChange = (selected: SelectRecordEnhanced): void => {
    if (selected) {
      onChange(property.path, Number(selected.value), selected.record);
      setSelectedOption(selected);
    } else {
      onChange(property.path, null);
      setSelectedOption(null);
    }
  };

  const error = record?.errors[property.path];

  const [selectedOption, setSelectedOption] = useState<SelectRecord>();
  const [loadingRecord, setLoadingRecord] = useState(0);

  const loadOptions = async (inputValue: string): Promise<SelectRecordEnhanced[]> => {
    setLoadingRecord((c) => c + 1);

    const optionRecords = await api.searchRecords({
      resourceId,
      query: inputValue,
    });

    const results = optionRecords.map((optionRecord: RecordJSON) => ({
      value: optionRecord.id,
      label: translateProperty(optionRecord.title, property.resourceId),
      record: optionRecord,
    }));

    const selected = results.find((option: SelectRecordEnhanced) => option.value === selectedId);
    setSelectedOption(selected);

    setLoadingRecord((c) => c - 1);

    return results;
  };

  return (
    <FormGroup error={Boolean(error)}>
      <PropertyLabel property={property} />
      <SelectAsync
        isMulti={property.custom.isMultiple}
        cacheOptions
        value={selectedOption}
        defaultOptions
        loadOptions={loadOptions}
        onChange={handleChange}
        isClearable
        isDisabled={property.isDisabled}
        isLoading={!!loadingRecord}
        {...property.props}
      />
      <FormMessage>{error?.message}</FormMessage>
    </FormGroup>
  );
};

export default Edit;
