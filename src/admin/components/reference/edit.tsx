import React, { FC, useState, useEffect, useMemo } from 'react';
import { FormGroup, FormMessage, SelectAsync } from '@adminjs/design-system';
import { ApiClient, EditPropertyProps, SelectRecord, RecordJSON, flat, useTranslation } from 'adminjs';

import PropertyLabel from '../label.js';

type CombinedProps = EditPropertyProps;
type SelectRecordEnhanced = SelectRecord & {
  record: RecordJSON;
};

const Edit: FC<CombinedProps> = (props) => {
  const { onChange, property, record } = props;
  const { reference: resourceId } = property;
  const { translateProperty } = useTranslation();
  const api = new ApiClient();

  if (!resourceId) {
    throw new Error(`Cannot reference resource in property '${property.path}'`);
  }

  const handleChange = (selected: SelectRecordEnhanced): void => {
    if (selected) {
      onChange(property.path, selected.value, selected.record);
    } else {
      onChange(property.path, null);
    }
  };

  const error = record?.errors[property.path];

  // const selectedId = useMemo(
  //   () => flat.get(record?.params, property.path) as string | undefined,
  //   [property.path, record?.params],
  // );

  const [loadedOptions, setLoadedOptions] = useState<SelectRecordEnhanced[]>([]);
  const [selectedOption, setSelectedOption] = useState<SelectRecord>();
  const [loadingRecord, setLoadingRecord] = useState(0);

  const loadOptions = async (inputValue: string): Promise<SelectRecordEnhanced[]> => {
    const optionRecords = await api.searchRecords({
      resourceId,
      query: inputValue,
    });

    const results = optionRecords.map((optionRecord: RecordJSON) => ({
      value: optionRecord.id,
      label: translateProperty(optionRecord.title, property.resourceId),
      record: optionRecord,
    }));

    setLoadedOptions(results);

    return results;
  };

  useEffect(() => {
    const selectedId = flat.get(record?.params, property.path);
    if (selectedId && loadedOptions.length && !loadingRecord) {
      setLoadingRecord((c) => c + 1);
      const { value, label } = loadedOptions.find((option: SelectRecordEnhanced) => option.value === selectedId);
      if (!value || !label) return;
      setSelectedOption({
        value,
        label,
      });
      setLoadingRecord((c) => c - 1);
    }
  }, [resourceId, loadedOptions, loadingRecord, record?.params, property.path]);

  return (
    <FormGroup error={Boolean(error)}>
      <PropertyLabel property={property} />
      <SelectAsync
        isMulti={property.isArray}
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
