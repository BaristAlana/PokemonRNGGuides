import React from "react";
import {
  FormikNumberInput,
  ResultColumn,
  RngToolForm,
  RngToolSubmit,
  Field,
} from "~/components";
import { rngTools, SeedTime4, SeedTime4Calibrate } from "~/rngTools";
import {
  addRngTime,
  formatRngDateTime,
  rngDate,
  RngDateSchema,
  rngTime,
  RngTimeSchema,
} from "~/utils/time";
import { FormikDatePicker, FormikTimePicker } from "~/components/datePicker";
import { z } from "zod";

const columns: ResultColumn<SeedTime4Calibrate>[] = [
  {
    title: "Seed",
    dataIndex: "seed",
    monospace: true,
    render: (seed) => seed.toString(16).toUpperCase().padStart(8, "0"),
  },
  {
    title: "Date/Time",
    dataIndex: "datetime",
    render: (date) => formatRngDateTime(date, { seconds: true }),
  },
  {
    title: "Delay",
    dataIndex: "delay",
  },
  {
    title: "Coin Flips",
    dataIndex: "coin_flips",
    render: (coinFlips) =>
      coinFlips.map((flip) => (flip === "Heads" ? "H" : "T")).join(", "),
  },
];

const Validator = z.object({
  date: RngDateSchema,
  time: RngTimeSchema,
  delay: z.number().int().min(0),
  delay_calibration: z.number().int().min(0),
  second_calibration: z.number().int().min(0),
});

type FormState = z.infer<typeof Validator>;

const fields: Field[] = [
  {
    label: "Searcher Result Date",
    input: <FormikDatePicker<FormState> name="date" disabled />,
  },
  {
    label: "Searcher Result Time",
    input: <FormikTimePicker<FormState> name="time" showSecond disabled />,
  },
  {
    label: "Searcher Result Delay",
    input: (
      <FormikNumberInput<FormState> name="delay" disabled numType="decimal" />
    ),
  },
  {
    label: "Delay Calibration +/-",
    input: (
      <FormikNumberInput<FormState>
        name="delay_calibration"
        numType="decimal"
      />
    ),
  },
  {
    label: "Second Calibration +/-",
    input: (
      <FormikNumberInput<FormState>
        name="second_calibration"
        numType="decimal"
      />
    ),
  },
];

type Props = {
  selectedSeedTime?: SeedTime4 | null;
};

export const DpptSeedCalibrate = ({ selectedSeedTime }: Props) => {
  const [results, setResults] = React.useState<SeedTime4Calibrate[]>([]);

  const selectedSeed = selectedSeedTime?.seed ?? 0;

  const initialValues = React.useMemo((): FormState => {
    if (selectedSeedTime == null) {
      return {
        date: rngDate(),
        time: rngTime(),
        delay: 0,
        delay_calibration: 0,
        second_calibration: 0,
      };
    }

    return {
      date: selectedSeedTime.datetime,
      time: selectedSeedTime.datetime,
      delay: selectedSeedTime.delay,
      delay_calibration: 0,
      second_calibration: 0,
    };
  }, [selectedSeedTime]);

  const onSubmit = React.useCallback<RngToolSubmit<FormState>>(
    async (opts) => {
      const results = await rngTools.dppt_calibrate_seedtime(
        {
          seed: selectedSeed,
          datetime: addRngTime(opts.date, opts.time),
          delay: opts.delay,
          coin_flips: [],
        },
        {
          delay_calibration: opts.delay_calibration,
          second_calibration: opts.second_calibration,
          entei_route: null,
          lati_route: null,
          raikou_route: null,
        },
      );

      setResults(results);
    },
    [selectedSeed],
  );

  return (
    <RngToolForm<FormState, SeedTime4Calibrate>
      fields={fields}
      columns={columns}
      results={results}
      initialValues={initialValues}
      validationSchema={Validator}
      onSubmit={onSubmit}
      submitTrackerId="calibrate_dppt_seed"
    />
  );
};
