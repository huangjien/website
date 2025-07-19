import React from "react";
import { useTranslation } from "react-i18next";
import { Input, Select, SelectItem } from "@heroui/react";

/**
 * Configuration tab component for AI settings
 */
const ConfigurationTab = ({
  model,
  setModel,
  temperature,
  setTemperature,
  trackSpeed,
  setTrackSpeed,
}) => {
  const { t } = useTranslation();

  const models = [
    { key: "gpt-4o-mini", label: "GPT-4o Mini" },
    { key: "gpt-4o", label: "GPT-4o" },
    { key: "o1-mini", label: "o1-mini" },
    { key: "o1", label: "o1" },
    { key: "o3-mini", label: "o3-mini" },
  ];

  return (
    <div className='flex flex-col gap-4'>
      <Select
        label={t("ai.select_model")}
        placeholder={t("ai.select_model")}
        selectedKeys={[model]}
        onSelectionChange={(keys) => setModel(Array.from(keys)[0])}
        className='max-w-xs'
      >
        {models.map((modelOption) => (
          <SelectItem key={modelOption.key} value={modelOption.key}>
            {modelOption.label}
          </SelectItem>
        ))}
      </Select>

      <Input
        type='number'
        label={t("ai.temperature")}
        placeholder={t("ai.value_range_0_1")}
        value={temperature.toString()}
        onChange={(e) => setTemperature(parseFloat(e.target.value) || 0)}
        min={0}
        max={2}
        step={0.1}
        className='max-w-xs'
      />

      <Input
        type='number'
        label={t("ai.track_speed")}
        placeholder={t("ai.value_range_50_500")}
        value={trackSpeed.toString()}
        onChange={(e) => setTrackSpeed(parseInt(e.target.value) || 300)}
        min={50}
        max={500}
        step={10}
        className='max-w-xs'
      />
    </div>
  );
};

export default ConfigurationTab;
