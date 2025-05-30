import React from "react";
import {
  FormikNumberInput,
  ResultColumn,
  RngToolForm,
  RngToolSubmit,
  Field,
} from "~/components";
import { rngTools } from "~/rngTools";
import { z } from "zod";
import { HexSchema } from "~/utils/number";

type GeneratorResult = { sid: number };

const columns: ResultColumn<GeneratorResult>[] = [
  {
    title: "SID",
    dataIndex: "sid",
  },
];

const Validator = z.object({
  tid: z.number().int().min(0).max(65535),
  feebasSeed: HexSchema(0xffff),
  initialAdvances: z.number().int().min(0),
  maxAdvances: z.number().int().min(0),
});

export type FormState = z.infer<typeof Validator>;

const initialValues: FormState = {
  tid: 14223,
  feebasSeed: 0xa4fd,
  initialAdvances: 0,
  maxAdvances: 10000,
};

const fields: Field[] = [
  {
    label: "TID",
    input: <FormikNumberInput<FormState> name="tid" numType="decimal" />,
  },
  {
    label: "Feebas Seed",
    input: <FormikNumberInput<FormState> name="feebasSeed" numType="hex" />,
  },
  {
    label: "Initial Advances",
    input: (
      <FormikNumberInput<FormState> name="initialAdvances" numType="decimal" />
    ),
  },
  {
    label: "Max Advances",
    input: (
      <FormikNumberInput<FormState> name="maxAdvances" numType="decimal" />
    ),
  },
];

type Props = {
  game: "rs" | "emerald";
};

export const Gen3Sid = ({ game }: Props) => {
  const [results, setResults] = React.useState<GeneratorResult[]>([]);

  const onSubmit = React.useCallback<RngToolSubmit<FormState>>(
    async (opts) => {
      const generate =
        game === "rs"
          ? rngTools.rs_sid_from_feebas_seed
          : rngTools.emerald_sid_from_feebas_seed;

      const results = await generate(
        opts.tid,
        opts.feebasSeed,
        opts.initialAdvances,
        opts.maxAdvances,
      );

      setResults([...results].map(({ sid }) => ({ sid })));
    },
    [game],
  );

  return (
    <RngToolForm<FormState, GeneratorResult>
      fields={fields}
      columns={columns}
      results={results}
      initialValues={initialValues}
      validationSchema={Validator}
      onSubmit={onSubmit}
      submitTrackerId="generate_gen3_sid"
    />
  );
};
