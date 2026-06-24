import { useState } from 'react';
import { BarChart3, Calculator, ChevronDown, ChevronRight, Delete, Divide, Equal, Landmark, Minus, Percent, Plus, Save, Scale, TrendingUp, X } from 'lucide-react';
import { Button, Card, Field, inputClass, PageTitle } from '../components/ui';
import { loadLocal, saveLocal } from '../lib/localStore';

type ToolKey =
  | 'basic'
  | 'pharmaDose'
  | 'pharmaDilution'
  | 'pharmaConcentration'
  | 'pharmaInfusion'
  | 'pharmaHalfLife'
  | 'pharmaUnits'
  | 'interest'
  | 'loan'
  | 'rate'
  | 'stats'
  | 'swot'
  | 'units'
  | 'json'
  | 'margin'
  | 'breakeven'
  | 'depreciation'
  | 'dre'
  | 'balance'
  | 'ratios';

type HistoryItem = {
  id: string;
  tool: string;
  summary: string;
  createdAt: string;
};

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const percent = new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 });

const tools: { key: ToolKey; label: string; area: string; icon: React.ElementType }[] = [
  { key: 'basic', label: 'Calculadora tradicional', area: 'Calculos rapidos', icon: Calculator },
  { key: 'pharmaDose', label: 'Dose por peso', area: 'Farmacia', icon: Calculator },
  { key: 'pharmaDilution', label: 'Diluicao C1V1=C2V2', area: 'Farmacia', icon: Percent },
  { key: 'pharmaConcentration', label: 'Concentracao mg/mL', area: 'Farmacia', icon: Scale },
  { key: 'pharmaInfusion', label: 'Infusao e gotas/min', area: 'Farmacia hospitalar', icon: Calculator },
  { key: 'pharmaHalfLife', label: 'Meia-vida', area: 'Farmacocinetica', icon: BarChart3 },
  { key: 'pharmaUnits', label: 'Conversor farmaceutico', area: 'Farmacia', icon: Calculator },
  { key: 'interest', label: 'Juros simples e compostos', area: 'Matematica financeira', icon: Percent },
  { key: 'loan', label: 'Financiamento Price/SAC', area: 'Matematica financeira', icon: Calculator },
  { key: 'rate', label: 'Conversor de taxas', area: 'Economia e financas', icon: Percent },
  { key: 'stats', label: 'Estatistica basica', area: 'Estatistica', icon: BarChart3 },
  { key: 'swot', label: 'SWOT e 5W2H', area: 'Administracao', icon: Scale },
  { key: 'units', label: 'Conversor de unidades', area: 'Exatas', icon: Calculator },
  { key: 'json', label: 'Formatador JSON', area: 'Programacao e TI', icon: Calculator },
  { key: 'margin', label: 'Margem e markup', area: 'Custos e precificacao', icon: TrendingUp },
  { key: 'breakeven', label: 'Ponto de equilibrio', area: 'Contabilidade gerencial', icon: Scale },
  { key: 'depreciation', label: 'Depreciacao linear', area: 'Contabilidade patrimonial', icon: Landmark },
  { key: 'dre', label: 'DRE simplificada', area: 'Demonstracoes contabeis', icon: BarChart3 },
  { key: 'balance', label: 'Balanco patrimonial', area: 'Contabilidade geral', icon: Calculator },
  { key: 'ratios', label: 'Indicadores financeiros', area: 'Analise contabil', icon: BarChart3 }
];

export function ToolsPage() {
  const [activeTool, setActiveTool] = useState<ToolKey>('basic');
  const [activeArea, setActiveArea] = useState(() => tools.find((tool) => tool.key === 'basic')?.area ?? '');
  const [history, setHistory] = useState(() => loadLocal<HistoryItem[]>('hg-tool-history', []));
  const groupedTools = groupToolsByArea();

  function saveResult(summary: string) {
    const tool = tools.find((item) => item.key === activeTool)?.label ?? 'Ferramenta';
    const next = [{ id: crypto.randomUUID(), tool, summary, createdAt: new Date().toISOString() }, ...history].slice(0, 10);
    setHistory(next);
    saveLocal('hg-tool-history', next);
  }

  return (
    <>
      <PageTitle title="Ferramentas da materia" subtitle="Calculadoras de apoio para Contabeis, custos, matematica financeira e analise." />

      <div className="grid gap-4 xl:grid-cols-[0.78fr_1.22fr]">
        <div className="grid gap-4">
          <Card>
            <div className="grid gap-2">
              {groupedTools.map(([area, areaTools], index) => {
                const isOpen = activeArea ? activeArea === area : index === 0;
                return (
                  <div key={area} className="rounded-md border border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setActiveArea(isOpen ? '' : area)}
                      className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left"
                    >
                      <span>
                        <span className="block text-sm font-semibold">{area}</span>
                        <span className="block text-xs text-slate-500 dark:text-slate-400">{areaTools.length} ferramenta{areaTools.length === 1 ? '' : 's'}</span>
                      </span>
                      {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>
                    {isOpen && (
                      <div className="grid gap-2 border-t border-slate-200 p-2 dark:border-slate-800">
                        {areaTools.map((tool) => (
                          <button
                            key={tool.key}
                            type="button"
                            onClick={() => {
                              setActiveTool(tool.key);
                              setActiveArea(tool.area);
                            }}
                            className={`flex items-center gap-3 rounded-md border px-3 py-2 text-left transition ${
                              activeTool === tool.key
                                ? 'border-brand-500 bg-brand-50 text-brand-800 dark:border-brand-400 dark:bg-brand-900/30 dark:text-brand-100'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
                            }`}
                          >
                            <tool.icon size={18} />
                            <span className="block text-sm font-semibold">{tool.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <h3 className="mb-3 font-semibold">Historico recente</h3>
            <div className="grid gap-2 text-sm">
              {history.length ? (
                history.map((item) => (
                  <div key={item.id} className="rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-800">
                    <p className="font-medium">{item.tool}</p>
                    <p className="mt-1 text-slate-600 dark:text-slate-300">{item.summary}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 dark:text-slate-400">Nenhum resultado salvo ainda.</p>
              )}
            </div>
          </Card>
        </div>

        <ToolPanel activeTool={activeTool} onSave={saveResult} />
      </div>
    </>
  );
}

function ToolPanel({ activeTool, onSave }: { activeTool: ToolKey; onSave: (summary: string) => void }) {
  if (activeTool === 'basic') return <BasicCalculator onSave={onSave} />;
  if (activeTool === 'pharmaDose') return <PharmaDoseCalculator onSave={onSave} />;
  if (activeTool === 'pharmaDilution') return <PharmaDilutionCalculator onSave={onSave} />;
  if (activeTool === 'pharmaConcentration') return <PharmaConcentrationCalculator onSave={onSave} />;
  if (activeTool === 'pharmaInfusion') return <PharmaInfusionCalculator onSave={onSave} />;
  if (activeTool === 'pharmaHalfLife') return <PharmaHalfLifeCalculator onSave={onSave} />;
  if (activeTool === 'pharmaUnits') return <PharmaUnitConverter onSave={onSave} />;
  if (activeTool === 'interest') return <InterestCalculator onSave={onSave} />;
  if (activeTool === 'loan') return <LoanCalculator onSave={onSave} />;
  if (activeTool === 'rate') return <RateConverter onSave={onSave} />;
  if (activeTool === 'stats') return <StatsCalculator onSave={onSave} />;
  if (activeTool === 'swot') return <SwotPlanner onSave={onSave} />;
  if (activeTool === 'units') return <UnitConverter onSave={onSave} />;
  if (activeTool === 'json') return <JsonFormatter onSave={onSave} />;
  if (activeTool === 'margin') return <MarginCalculator onSave={onSave} />;
  if (activeTool === 'breakeven') return <BreakevenCalculator onSave={onSave} />;
  if (activeTool === 'depreciation') return <DepreciationCalculator onSave={onSave} />;
  if (activeTool === 'dre') return <DreCalculator onSave={onSave} />;
  if (activeTool === 'balance') return <BalanceCalculator onSave={onSave} />;
  return <RatiosCalculator onSave={onSave} />;
}

function groupToolsByArea() {
  const groups = new Map<string, typeof tools>();

  tools.forEach((tool) => {
    groups.set(tool.area, [...(groups.get(tool.area) ?? []), tool]);
  });

  return Array.from(groups.entries()).sort(([first], [second]) => first.localeCompare(second));
}

function BasicCalculator({ onSave }: { onSave: (summary: string) => void }) {
  const [display, setDisplay] = useState('0');
  const [storedValue, setStoredValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForNext, setWaitingForNext] = useState(false);
  const summary = `Resultado: ${display}`;

  function inputDigit(digit: string) {
    setDisplay((current) => {
      if (waitingForNext) {
        setWaitingForNext(false);
        return digit;
      }
      return current === '0' ? digit : `${current}${digit}`;
    });
  }

  function inputDecimal() {
    setDisplay((current) => {
      if (waitingForNext) {
        setWaitingForNext(false);
        return '0.';
      }
      return current.includes('.') ? current : `${current}.`;
    });
  }

  function clear() {
    setDisplay('0');
    setStoredValue(null);
    setOperator(null);
    setWaitingForNext(false);
  }

  function erase() {
    if (waitingForNext) return;
    setDisplay((current) => (current.length > 1 ? current.slice(0, -1) : '0'));
  }

  function toggleSign() {
    setDisplay((current) => (current === '0' ? current : current.startsWith('-') ? current.slice(1) : `-${current}`));
  }

  function applyPercent() {
    setDisplay((current) => formatBasicNumber(Number(current) / 100));
  }

  function chooseOperator(nextOperator: string) {
    const currentValue = Number(display);

    if (storedValue === null) {
      setStoredValue(currentValue);
    } else if (operator) {
      const result = calculate(storedValue, currentValue, operator);
      setDisplay(formatBasicNumber(result));
      setStoredValue(result);
    }

    setOperator(nextOperator);
    setWaitingForNext(true);
  }

  function resolve() {
    if (storedValue === null || !operator) return;
    const result = calculate(storedValue, Number(display), operator);
    setDisplay(formatBasicNumber(result));
    setStoredValue(null);
    setOperator(null);
    setWaitingForNext(true);
  }

  const buttons = [
    { label: 'AC', action: clear, className: 'bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700' },
    { label: '+/-', action: toggleSign, className: 'bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700' },
    { label: '%', action: applyPercent, icon: Percent, className: 'bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700' },
    { label: '/', action: () => chooseOperator('/'), icon: Divide, className: 'bg-brand-600 text-white hover:bg-brand-700' },
    { label: '7', action: () => inputDigit('7') },
    { label: '8', action: () => inputDigit('8') },
    { label: '9', action: () => inputDigit('9') },
    { label: '*', action: () => chooseOperator('*'), icon: X, className: 'bg-brand-600 text-white hover:bg-brand-700' },
    { label: '4', action: () => inputDigit('4') },
    { label: '5', action: () => inputDigit('5') },
    { label: '6', action: () => inputDigit('6') },
    { label: '-', action: () => chooseOperator('-'), icon: Minus, className: 'bg-brand-600 text-white hover:bg-brand-700' },
    { label: '1', action: () => inputDigit('1') },
    { label: '2', action: () => inputDigit('2') },
    { label: '3', action: () => inputDigit('3') },
    { label: '+', action: () => chooseOperator('+'), icon: Plus, className: 'bg-brand-600 text-white hover:bg-brand-700' },
    { label: '0', action: () => inputDigit('0'), className: 'col-span-2 bg-slate-100 text-slate-950 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700' },
    { label: '.', action: inputDecimal },
    { label: '=', action: resolve, icon: Equal, className: 'bg-emerald-600 text-white hover:bg-emerald-700' }
  ];

  return (
    <CalculatorCard title="Calculadora tradicional" summary={summary} onSave={onSave}>
      <div className="mx-auto grid w-full max-w-md gap-3">
        <div className="rounded-md bg-slate-950 px-4 py-5 text-right text-4xl font-bold text-white shadow-inner">
          <span className="block min-h-12 break-all">{display}</span>
          <span className="mt-1 block text-sm font-medium text-slate-400">{storedValue !== null && operator ? `${formatBasicNumber(storedValue)} ${operator}` : ' '}</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {buttons.map((button) => {
            const Icon = button.icon;
            return (
              <button
                key={button.label}
                type="button"
                onClick={button.action}
                className={`flex h-14 items-center justify-center rounded-md text-lg font-bold transition ${button.className ?? 'bg-slate-100 text-slate-950 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700'}`}
                title={button.label}
              >
                {Icon ? <Icon size={20} /> : button.label}
              </button>
            );
          })}
        </div>
        <button type="button" onClick={erase} className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
          <Delete size={17} />Apagar ultimo digito
        </button>
      </div>
    </CalculatorCard>
  );
}

function PharmaDoseCalculator({ onSave }: { onSave: (summary: string) => void }) {
  const [form, setForm] = useState({ weight: 70, doseMgKg: 10, dosesPerDay: 2 });
  const dailyDose = form.weight * form.doseMgKg;
  const dosePerAdministration = form.dosesPerDay > 0 ? dailyDose / form.dosesPerDay : 0;
  const summary = `Dose diaria: ${formatBasicNumber(dailyDose)} mg | por tomada: ${formatBasicNumber(dosePerAdministration)} mg`;

  return (
    <CalculatorCard title="Dose por peso" summary={summary} onSave={onSave}>
      <SafetyNote />
      <div className="grid gap-3 sm:grid-cols-3">
        <NumberField label="Peso do paciente (kg)" value={form.weight} onChange={(weight) => setForm({ ...form, weight })} />
        <NumberField label="Dose prescrita (mg/kg/dia)" value={form.doseMgKg} onChange={(doseMgKg) => setForm({ ...form, doseMgKg })} />
        <NumberField label="Tomadas por dia" value={form.dosesPerDay} onChange={(dosesPerDay) => setForm({ ...form, dosesPerDay })} />
      </div>
      <ResultGrid items={[['Dose diaria total', `${formatBasicNumber(dailyDose)} mg`], ['Dose por tomada', `${formatBasicNumber(dosePerAdministration)} mg`], ['Tomadas ao dia', formatBasicNumber(form.dosesPerDay)], ['Peso usado', `${formatBasicNumber(form.weight)} kg`]]} />
    </CalculatorCard>
  );
}

function PharmaDilutionCalculator({ onSave }: { onSave: (summary: string) => void }) {
  const [form, setForm] = useState({ c1: 100, c2: 20, v2: 250 });
  const v1 = form.c1 > 0 ? (form.c2 * form.v2) / form.c1 : 0;
  const diluent = Math.max(form.v2 - v1, 0);
  const summary = `Usar ${formatBasicNumber(v1)} mL da solucao estoque + ${formatBasicNumber(diluent)} mL de diluente`;

  return (
    <CalculatorCard title="Diluicao C1V1 = C2V2" summary={summary} onSave={onSave}>
      <SafetyNote />
      <div className="grid gap-3 sm:grid-cols-3">
        <NumberField label="C1 concentracao inicial" value={form.c1} onChange={(c1) => setForm({ ...form, c1 })} />
        <NumberField label="C2 concentracao desejada" value={form.c2} onChange={(c2) => setForm({ ...form, c2 })} />
        <NumberField label="V2 volume final (mL)" value={form.v2} onChange={(v2) => setForm({ ...form, v2 })} />
      </div>
      <ResultGrid items={[['V1 solucao estoque', `${formatBasicNumber(v1)} mL`], ['Diluente aproximado', `${formatBasicNumber(diluent)} mL`], ['Volume final', `${formatBasicNumber(form.v2)} mL`], ['Formula', 'C1 x V1 = C2 x V2']]} />
    </CalculatorCard>
  );
}

function PharmaConcentrationCalculator({ onSave }: { onSave: (summary: string) => void }) {
  const [form, setForm] = useState({ amountMg: 500, volumeMl: 10, targetDoseMg: 250 });
  const concentration = form.volumeMl > 0 ? form.amountMg / form.volumeMl : 0;
  const requiredVolume = concentration > 0 ? form.targetDoseMg / concentration : 0;
  const summary = `Concentracao: ${formatBasicNumber(concentration)} mg/mL | volume para dose: ${formatBasicNumber(requiredVolume)} mL`;

  return (
    <CalculatorCard title="Concentracao mg/mL" summary={summary} onSave={onSave}>
      <SafetyNote />
      <div className="grid gap-3 sm:grid-cols-3">
        <NumberField label="Quantidade do farmaco (mg)" value={form.amountMg} onChange={(amountMg) => setForm({ ...form, amountMg })} />
        <NumberField label="Volume final (mL)" value={form.volumeMl} onChange={(volumeMl) => setForm({ ...form, volumeMl })} />
        <NumberField label="Dose desejada (mg)" value={form.targetDoseMg} onChange={(targetDoseMg) => setForm({ ...form, targetDoseMg })} />
      </div>
      <ResultGrid items={[['Concentracao', `${formatBasicNumber(concentration)} mg/mL`], ['Volume para dose', `${formatBasicNumber(requiredVolume)} mL`], ['Dose informada', `${formatBasicNumber(form.targetDoseMg)} mg`], ['Volume total', `${formatBasicNumber(form.volumeMl)} mL`]]} />
    </CalculatorCard>
  );
}

function PharmaInfusionCalculator({ onSave }: { onSave: (summary: string) => void }) {
  const [form, setForm] = useState({ volumeMl: 500, timeHours: 4, dropFactor: 20, weightKg: 70, doseMcgKgMin: 0.5, concentrationMcgMl: 100 });
  const mlPerHour = form.timeHours > 0 ? form.volumeMl / form.timeHours : 0;
  const dropsPerMinute = form.timeHours > 0 ? (form.volumeMl * form.dropFactor) / (form.timeHours * 60) : 0;
  const doseMlHour = form.concentrationMcgMl > 0 ? (form.doseMcgKgMin * form.weightKg * 60) / form.concentrationMcgMl : 0;
  const summary = `${formatBasicNumber(mlPerHour)} mL/h | ${formatBasicNumber(dropsPerMinute)} gotas/min`;

  return (
    <CalculatorCard title="Infusao e gotas/min" summary={summary} onSave={onSave}>
      <SafetyNote />
      <div className="grid gap-3 sm:grid-cols-3">
        <NumberField label="Volume (mL)" value={form.volumeMl} onChange={(volumeMl) => setForm({ ...form, volumeMl })} />
        <NumberField label="Tempo (horas)" value={form.timeHours} onChange={(timeHours) => setForm({ ...form, timeHours })} />
        <NumberField label="Fator gotas/mL" value={form.dropFactor} onChange={(dropFactor) => setForm({ ...form, dropFactor })} />
        <NumberField label="Peso (kg)" value={form.weightKg} onChange={(weightKg) => setForm({ ...form, weightKg })} />
        <NumberField label="Dose mcg/kg/min" value={form.doseMcgKgMin} onChange={(doseMcgKgMin) => setForm({ ...form, doseMcgKgMin })} />
        <NumberField label="Concentracao mcg/mL" value={form.concentrationMcgMl} onChange={(concentrationMcgMl) => setForm({ ...form, concentrationMcgMl })} />
      </div>
      <ResultGrid items={[['Velocidade', `${formatBasicNumber(mlPerHour)} mL/h`], ['Gotejamento', `${formatBasicNumber(dropsPerMinute)} gotas/min`], ['Dose titulada', `${formatBasicNumber(doseMlHour)} mL/h`], ['Fator usado', `${formatBasicNumber(form.dropFactor)} gotas/mL`]]} />
    </CalculatorCard>
  );
}

function PharmaHalfLifeCalculator({ onSave }: { onSave: (summary: string) => void }) {
  const [form, setForm] = useState({ initialAmount: 100, halfLifeHours: 6, elapsedHours: 18 });
  const cycles = form.halfLifeHours > 0 ? form.elapsedHours / form.halfLifeHours : 0;
  const remaining = form.initialAmount * Math.pow(0.5, cycles);
  const eliminated = form.initialAmount - remaining;
  const summary = `Restante: ${formatBasicNumber(remaining)} | eliminado: ${formatPercent(safeRatio(eliminated, form.initialAmount))}`;

  return (
    <CalculatorCard title="Meia-vida" summary={summary} onSave={onSave}>
      <SafetyNote />
      <div className="grid gap-3 sm:grid-cols-3">
        <NumberField label="Quantidade inicial" value={form.initialAmount} onChange={(initialAmount) => setForm({ ...form, initialAmount })} />
        <NumberField label="Meia-vida (horas)" value={form.halfLifeHours} onChange={(halfLifeHours) => setForm({ ...form, halfLifeHours })} />
        <NumberField label="Tempo decorrido (horas)" value={form.elapsedHours} onChange={(elapsedHours) => setForm({ ...form, elapsedHours })} />
      </div>
      <ResultGrid items={[['Meias-vidas passadas', formatBasicNumber(cycles)], ['Quantidade restante', formatBasicNumber(remaining)], ['Quantidade eliminada', formatBasicNumber(eliminated)], ['Percentual restante', formatPercent(safeRatio(remaining, form.initialAmount))]]} />
    </CalculatorCard>
  );
}

function PharmaUnitConverter({ onSave }: { onSave: (summary: string) => void }) {
  const [form, setForm] = useState({ value: 500, type: 'mgToG' });
  const conversions: Record<string, { label: string; unit: string; convert: (value: number) => number }> = {
    mcgToMg: { label: 'mcg para mg', unit: 'mg', convert: (value) => value / 1000 },
    mgToMcg: { label: 'mg para mcg', unit: 'mcg', convert: (value) => value * 1000 },
    mgToG: { label: 'mg para g', unit: 'g', convert: (value) => value / 1000 },
    gToMg: { label: 'g para mg', unit: 'mg', convert: (value) => value * 1000 },
    mlToL: { label: 'mL para L', unit: 'L', convert: (value) => value / 1000 },
    lToMl: { label: 'L para mL', unit: 'mL', convert: (value) => value * 1000 },
    percentToMgMl: { label: '% m/v para mg/mL', unit: 'mg/mL', convert: (value) => value * 10 },
    mgMlToPercent: { label: 'mg/mL para % m/v', unit: '%', convert: (value) => value / 10 }
  };
  const selected = conversions[form.type];
  const converted = selected.convert(form.value);
  const summary = `${formatBasicNumber(form.value)} -> ${formatBasicNumber(converted)} ${selected.unit}`;

  return (
    <CalculatorCard title="Conversor farmaceutico" summary={summary} onSave={onSave}>
      <SafetyNote />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Valor" value={form.value} onChange={(value) => setForm({ ...form, value })} />
        <Field label="Conversao">
          <select className={inputClass} value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
            {Object.entries(conversions).map(([key, conversion]) => <option key={key} value={key}>{conversion.label}</option>)}
          </select>
        </Field>
      </div>
      <ResultGrid items={[['Resultado', `${formatBasicNumber(converted)} ${selected.unit}`], ['Conversao', selected.label], ['Valor original', formatBasicNumber(form.value)], ['Unidade final', selected.unit]]} />
    </CalculatorCard>
  );
}

function InterestCalculator({ onSave }: { onSave: (summary: string) => void }) {
  const [form, setForm] = useState({ principal: 1000, monthlyRate: 2, months: 12 });
  const simpleInterest = form.principal * (form.monthlyRate / 100) * form.months;
  const compoundAmount = form.principal * Math.pow(1 + form.monthlyRate / 100, form.months);
  const summary = `Simples: ${formatMoney(form.principal + simpleInterest)} | Compostos: ${formatMoney(compoundAmount)}`;

  return (
    <CalculatorCard title="Juros simples e compostos" summary={summary} onSave={onSave}>
      <div className="grid gap-3 sm:grid-cols-3">
        <NumberField label="Capital inicial" value={form.principal} onChange={(principal) => setForm({ ...form, principal })} />
        <NumberField label="Taxa ao mes (%)" value={form.monthlyRate} onChange={(monthlyRate) => setForm({ ...form, monthlyRate })} />
        <NumberField label="Meses" value={form.months} onChange={(months) => setForm({ ...form, months })} />
      </div>
      <ResultGrid items={[['Juros simples', formatMoney(simpleInterest)], ['Montante simples', formatMoney(form.principal + simpleInterest)], ['Juros compostos', formatMoney(compoundAmount - form.principal)], ['Montante composto', formatMoney(compoundAmount)]]} />
    </CalculatorCard>
  );
}

function LoanCalculator({ onSave }: { onSave: (summary: string) => void }) {
  const [form, setForm] = useState({ amount: 50000, monthlyRate: 1.2, months: 48 });
  const rate = form.monthlyRate / 100;
  const pricePayment = rate === 0 ? form.amount / form.months : (form.amount * rate) / (1 - Math.pow(1 + rate, -form.months));
  const priceTotal = pricePayment * form.months;
  const sacAmortization = form.amount / form.months;
  const firstSac = sacAmortization + form.amount * rate;
  const lastSac = sacAmortization + sacAmortization * rate;
  const summary = `Price: ${formatMoney(pricePayment)} | SAC inicial: ${formatMoney(firstSac)}`;

  return (
    <CalculatorCard title="Financiamento Price/SAC" summary={summary} onSave={onSave}>
      <div className="grid gap-3 sm:grid-cols-3">
        <NumberField label="Valor financiado" value={form.amount} onChange={(amount) => setForm({ ...form, amount })} />
        <NumberField label="Taxa ao mes (%)" value={form.monthlyRate} onChange={(monthlyRate) => setForm({ ...form, monthlyRate })} />
        <NumberField label="Parcelas" value={form.months} onChange={(months) => setForm({ ...form, months })} />
      </div>
      <ResultGrid items={[['Parcela Price', formatMoney(pricePayment)], ['Total Price', formatMoney(priceTotal)], ['1a parcela SAC', formatMoney(firstSac)], ['Ultima parcela SAC', formatMoney(lastSac)]]} />
    </CalculatorCard>
  );
}

function RateConverter({ onSave }: { onSave: (summary: string) => void }) {
  const [form, setForm] = useState({ rate: 2, mode: 'monthlyToAnnual' });
  const decimal = form.rate / 100;
  const converted = form.mode === 'monthlyToAnnual' ? Math.pow(1 + decimal, 12) - 1 : Math.pow(1 + decimal, 1 / 12) - 1;
  const summary = `${form.rate}% ${form.mode === 'monthlyToAnnual' ? 'ao mes' : 'ao ano'} = ${formatPercent(converted)} ${form.mode === 'monthlyToAnnual' ? 'ao ano' : 'ao mes'}`;

  return (
    <CalculatorCard title="Conversor de taxas" summary={summary} onSave={onSave}>
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Taxa (%)" value={form.rate} onChange={(rate) => setForm({ ...form, rate })} />
        <Field label="Conversao">
          <select className={inputClass} value={form.mode} onChange={(event) => setForm({ ...form, mode: event.target.value })}>
            <option value="monthlyToAnnual">Mensal para anual equivalente</option>
            <option value="annualToMonthly">Anual para mensal equivalente</option>
          </select>
        </Field>
      </div>
      <ResultGrid items={[['Taxa equivalente', formatPercent(converted)], ['Fator', (1 + converted).toFixed(6)], ['Taxa informada', `${form.rate}%`], ['Regime', 'Composto']]} />
    </CalculatorCard>
  );
}

function StatsCalculator({ onSave }: { onSave: (summary: string) => void }) {
  const [values, setValues] = useState('10, 12, 14, 14, 18, 20');
  const numbers = parseNumberList(values);
  const sorted = [...numbers].sort((a, b) => a - b);
  const sum = numbers.reduce((total, item) => total + item, 0);
  const mean = numbers.length ? sum / numbers.length : 0;
  const median = sorted.length % 2 === 0 ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2 : sorted[Math.floor(sorted.length / 2)] ?? 0;
  const variance = numbers.length ? numbers.reduce((total, item) => total + Math.pow(item - mean, 2), 0) / numbers.length : 0;
  const deviation = Math.sqrt(variance);
  const summary = `Media: ${formatBasicNumber(mean)} | Mediana: ${formatBasicNumber(median)} | Desvio: ${formatBasicNumber(deviation)}`;

  return (
    <CalculatorCard title="Estatistica basica" summary={summary} onSave={onSave}>
      <Field label="Valores separados por virgula, ponto e virgula ou espaco">
        <textarea className={inputClass} rows={4} value={values} onChange={(event) => setValues(event.target.value)} />
      </Field>
      <ResultGrid items={[['Quantidade', numbers.length.toString()], ['Media', formatBasicNumber(mean)], ['Mediana', formatBasicNumber(median)], ['Desvio padrao', formatBasicNumber(deviation)]]} />
    </CalculatorCard>
  );
}

function SwotPlanner({ onSave }: { onSave: (summary: string) => void }) {
  const [form, setForm] = useState({
    strengths: 'Boa organizacao financeira',
    weaknesses: 'Pouco tempo para estudar',
    opportunities: 'Estagio na area',
    threats: 'Provas acumuladas',
    what: 'Montar plano de revisao',
    why: 'Melhorar desempenho',
    where: 'Em casa e na faculdade',
    when: 'Esta semana',
    who: 'Eu',
    how: 'Blocos de estudo e exercicios',
    howMuch: 'Sem custo'
  });
  const summary = `SWOT: ${countLines(form.strengths)} forcas, ${countLines(form.weaknesses)} fraquezas | Acao: ${form.what || 'nao definida'}`;

  return (
    <CalculatorCard title="SWOT e 5W2H" summary={summary} onSave={onSave}>
      <div className="grid gap-3 sm:grid-cols-2">
        <TextAreaField label="Forcas" value={form.strengths} onChange={(strengths) => setForm({ ...form, strengths })} />
        <TextAreaField label="Fraquezas" value={form.weaknesses} onChange={(weaknesses) => setForm({ ...form, weaknesses })} />
        <TextAreaField label="Oportunidades" value={form.opportunities} onChange={(opportunities) => setForm({ ...form, opportunities })} />
        <TextAreaField label="Ameacas" value={form.threats} onChange={(threats) => setForm({ ...form, threats })} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="O que?"><input className={inputClass} value={form.what} onChange={(event) => setForm({ ...form, what: event.target.value })} /></Field>
        <Field label="Por que?"><input className={inputClass} value={form.why} onChange={(event) => setForm({ ...form, why: event.target.value })} /></Field>
        <Field label="Onde?"><input className={inputClass} value={form.where} onChange={(event) => setForm({ ...form, where: event.target.value })} /></Field>
        <Field label="Quando?"><input className={inputClass} value={form.when} onChange={(event) => setForm({ ...form, when: event.target.value })} /></Field>
        <Field label="Quem?"><input className={inputClass} value={form.who} onChange={(event) => setForm({ ...form, who: event.target.value })} /></Field>
        <Field label="Como?"><input className={inputClass} value={form.how} onChange={(event) => setForm({ ...form, how: event.target.value })} /></Field>
        <Field label="Quanto custa?"><input className={inputClass} value={form.howMuch} onChange={(event) => setForm({ ...form, howMuch: event.target.value })} /></Field>
      </div>
    </CalculatorCard>
  );
}

function UnitConverter({ onSave }: { onSave: (summary: string) => void }) {
  const [form, setForm] = useState({ value: 1, type: 'metersToCentimeters' });
  const conversions: Record<string, { label: string; unit: string; convert: (value: number) => number }> = {
    metersToCentimeters: { label: 'Metros para centimetros', unit: 'cm', convert: (value) => value * 100 },
    centimetersToMeters: { label: 'Centimetros para metros', unit: 'm', convert: (value) => value / 100 },
    kilogramsToGrams: { label: 'Quilos para gramas', unit: 'g', convert: (value) => value * 1000 },
    gramsToKilograms: { label: 'Gramas para quilos', unit: 'kg', convert: (value) => value / 1000 },
    litersToMilliliters: { label: 'Litros para mililitros', unit: 'ml', convert: (value) => value * 1000 },
    millilitersToLiters: { label: 'Mililitros para litros', unit: 'l', convert: (value) => value / 1000 },
    celsiusToFahrenheit: { label: 'Celsius para Fahrenheit', unit: 'F', convert: (value) => value * 1.8 + 32 },
    fahrenheitToCelsius: { label: 'Fahrenheit para Celsius', unit: 'C', convert: (value) => (value - 32) / 1.8 }
  };
  const selected = conversions[form.type];
  const converted = selected.convert(form.value);
  const summary = `${form.value} -> ${formatBasicNumber(converted)} ${selected.unit}`;

  return (
    <CalculatorCard title="Conversor de unidades" summary={summary} onSave={onSave}>
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Valor" value={form.value} onChange={(value) => setForm({ ...form, value })} />
        <Field label="Tipo de conversao">
          <select className={inputClass} value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
            {Object.entries(conversions).map(([key, conversion]) => <option key={key} value={key}>{conversion.label}</option>)}
          </select>
        </Field>
      </div>
      <ResultGrid items={[['Resultado', `${formatBasicNumber(converted)} ${selected.unit}`], ['Conversao', selected.label], ['Valor original', formatBasicNumber(form.value)], ['Unidade final', selected.unit]]} />
    </CalculatorCard>
  );
}

function JsonFormatter({ onSave }: { onSave: (summary: string) => void }) {
  const [input, setInput] = useState('{"materia":"Contabilidade","nota":9.5,"aprovado":true}');
  const parsed = parseJson(input);
  const output = parsed.ok ? JSON.stringify(parsed.value, null, 2) : parsed.error;
  const summary = parsed.ok ? 'JSON valido e formatado' : 'JSON invalido';

  return (
    <CalculatorCard title="Formatador JSON" summary={summary} onSave={onSave}>
      <div className="grid gap-3 lg:grid-cols-2">
        <Field label="Entrada">
          <textarea className={`${inputClass} font-mono`} rows={12} value={input} onChange={(event) => setInput(event.target.value)} />
        </Field>
        <Field label="Saida">
          <textarea className={`${inputClass} font-mono`} rows={12} value={output} readOnly />
        </Field>
      </div>
    </CalculatorCard>
  );
}

function MarginCalculator({ onSave }: { onSave: (summary: string) => void }) {
  const [form, setForm] = useState({ revenue: 5000, cost: 3200 });
  const profit = form.revenue - form.cost;
  const margin = safeRatio(profit, form.revenue);
  const markup = safeRatio(profit, form.cost);
  const summary = `Lucro bruto: ${formatMoney(profit)} | Margem: ${formatPercent(margin)}`;

  return (
    <CalculatorCard title="Margem e markup" summary={summary} onSave={onSave}>
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Receita de venda" value={form.revenue} onChange={(revenue) => setForm({ ...form, revenue })} />
        <NumberField label="Custo total" value={form.cost} onChange={(cost) => setForm({ ...form, cost })} />
      </div>
      <ResultGrid items={[['Lucro bruto', formatMoney(profit)], ['Margem sobre venda', formatPercent(margin)], ['Markup sobre custo', formatPercent(markup)], ['Preco minimo para 30% margem', formatMoney(form.cost / 0.7)]]} />
    </CalculatorCard>
  );
}

function BreakevenCalculator({ onSave }: { onSave: (summary: string) => void }) {
  const [form, setForm] = useState({ fixedCosts: 8000, price: 80, variableCost: 45 });
  const contribution = form.price - form.variableCost;
  const units = contribution > 0 ? Math.ceil(form.fixedCosts / contribution) : 0;
  const summary = contribution > 0 ? `${units} unidades para cobrir ${formatMoney(form.fixedCosts)}` : 'Preco precisa ser maior que custo variavel';

  return (
    <CalculatorCard title="Ponto de equilibrio" summary={summary} onSave={onSave}>
      <div className="grid gap-3 sm:grid-cols-3">
        <NumberField label="Custos fixos" value={form.fixedCosts} onChange={(fixedCosts) => setForm({ ...form, fixedCosts })} />
        <NumberField label="Preco por unidade" value={form.price} onChange={(price) => setForm({ ...form, price })} />
        <NumberField label="Custo variavel unitario" value={form.variableCost} onChange={(variableCost) => setForm({ ...form, variableCost })} />
      </div>
      <ResultGrid items={[['Margem de contribuicao', formatMoney(contribution)], ['Unidades no equilibrio', units.toLocaleString('pt-BR')], ['Receita no equilibrio', formatMoney(units * form.price)], ['Sobra por unidade', formatMoney(contribution)]]} />
    </CalculatorCard>
  );
}

function DepreciationCalculator({ onSave }: { onSave: (summary: string) => void }) {
  const [form, setForm] = useState({ assetCost: 24000, residualValue: 4000, years: 5 });
  const depreciable = Math.max(form.assetCost - form.residualValue, 0);
  const annual = form.years > 0 ? depreciable / form.years : 0;
  const summary = `Depreciacao anual: ${formatMoney(annual)} | mensal: ${formatMoney(annual / 12)}`;

  return (
    <CalculatorCard title="Depreciacao linear" summary={summary} onSave={onSave}>
      <div className="grid gap-3 sm:grid-cols-3">
        <NumberField label="Valor do bem" value={form.assetCost} onChange={(assetCost) => setForm({ ...form, assetCost })} />
        <NumberField label="Valor residual" value={form.residualValue} onChange={(residualValue) => setForm({ ...form, residualValue })} />
        <NumberField label="Vida util em anos" value={form.years} onChange={(years) => setForm({ ...form, years })} />
      </div>
      <ResultGrid items={[['Base depreciavel', formatMoney(depreciable)], ['Depreciacao anual', formatMoney(annual)], ['Depreciacao mensal', formatMoney(annual / 12)], ['Taxa anual', formatPercent(form.years > 0 ? 1 / form.years : 0)]]} />
    </CalculatorCard>
  );
}

function DreCalculator({ onSave }: { onSave: (summary: string) => void }) {
  const [form, setForm] = useState({ revenue: 50000, deductions: 3500, cogs: 22000, expenses: 12000, financial: -800, taxes: 2100 });
  const netRevenue = form.revenue - form.deductions;
  const grossProfit = netRevenue - form.cogs;
  const operatingIncome = grossProfit - form.expenses;
  const netIncome = operatingIncome + form.financial - form.taxes;
  const summary = `Lucro liquido: ${formatMoney(netIncome)} | Margem liquida: ${formatPercent(safeRatio(netIncome, netRevenue))}`;

  return (
    <CalculatorCard title="DRE simplificada" summary={summary} onSave={onSave}>
      <div className="grid gap-3 sm:grid-cols-3">
        <NumberField label="Receita bruta" value={form.revenue} onChange={(revenue) => setForm({ ...form, revenue })} />
        <NumberField label="Deducoes" value={form.deductions} onChange={(deductions) => setForm({ ...form, deductions })} />
        <NumberField label="Custos/CMV" value={form.cogs} onChange={(cogs) => setForm({ ...form, cogs })} />
        <NumberField label="Despesas operacionais" value={form.expenses} onChange={(expenses) => setForm({ ...form, expenses })} />
        <NumberField label="Resultado financeiro" value={form.financial} onChange={(financial) => setForm({ ...form, financial })} />
        <NumberField label="IR/CSLL estimados" value={form.taxes} onChange={(taxes) => setForm({ ...form, taxes })} />
      </div>
      <ResultGrid items={[['Receita liquida', formatMoney(netRevenue)], ['Lucro bruto', formatMoney(grossProfit)], ['Resultado operacional', formatMoney(operatingIncome)], ['Lucro liquido', formatMoney(netIncome)]]} />
    </CalculatorCard>
  );
}

function BalanceCalculator({ onSave }: { onSave: (summary: string) => void }) {
  const [form, setForm] = useState({ currentAssets: 30000, nonCurrentAssets: 70000, currentLiabilities: 18000, nonCurrentLiabilities: 22000, equity: 60000 });
  const assets = form.currentAssets + form.nonCurrentAssets;
  const liabilitiesAndEquity = form.currentLiabilities + form.nonCurrentLiabilities + form.equity;
  const difference = assets - liabilitiesAndEquity;
  const summary = difference === 0 ? `Balanco fechado em ${formatMoney(assets)}` : `Diferenca de ${formatMoney(difference)}`;

  return (
    <CalculatorCard title="Balanco patrimonial" summary={summary} onSave={onSave}>
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Ativo circulante" value={form.currentAssets} onChange={(currentAssets) => setForm({ ...form, currentAssets })} />
        <NumberField label="Ativo nao circulante" value={form.nonCurrentAssets} onChange={(nonCurrentAssets) => setForm({ ...form, nonCurrentAssets })} />
        <NumberField label="Passivo circulante" value={form.currentLiabilities} onChange={(currentLiabilities) => setForm({ ...form, currentLiabilities })} />
        <NumberField label="Passivo nao circulante" value={form.nonCurrentLiabilities} onChange={(nonCurrentLiabilities) => setForm({ ...form, nonCurrentLiabilities })} />
        <NumberField label="Patrimonio liquido" value={form.equity} onChange={(equity) => setForm({ ...form, equity })} />
      </div>
      <ResultGrid items={[['Total do ativo', formatMoney(assets)], ['Passivo + PL', formatMoney(liabilitiesAndEquity)], ['Diferenca', formatMoney(difference)], ['Situacao', difference === 0 ? 'Fechado' : 'Revisar lancamentos']]} />
    </CalculatorCard>
  );
}

function RatiosCalculator({ onSave }: { onSave: (summary: string) => void }) {
  const [form, setForm] = useState({ currentAssets: 30000, currentLiabilities: 15000, totalDebt: 42000, equity: 58000, netIncome: 9500, revenue: 80000, assets: 100000 });
  const currentRatio = safeRatio(form.currentAssets, form.currentLiabilities);
  const debtToEquity = safeRatio(form.totalDebt, form.equity);
  const netMargin = safeRatio(form.netIncome, form.revenue);
  const roa = safeRatio(form.netIncome, form.assets);
  const summary = `Liquidez corrente: ${currentRatio.toFixed(2)} | Margem liquida: ${formatPercent(netMargin)}`;

  return (
    <CalculatorCard title="Indicadores financeiros" summary={summary} onSave={onSave}>
      <div className="grid gap-3 sm:grid-cols-3">
        <NumberField label="Ativo circulante" value={form.currentAssets} onChange={(currentAssets) => setForm({ ...form, currentAssets })} />
        <NumberField label="Passivo circulante" value={form.currentLiabilities} onChange={(currentLiabilities) => setForm({ ...form, currentLiabilities })} />
        <NumberField label="Divida total" value={form.totalDebt} onChange={(totalDebt) => setForm({ ...form, totalDebt })} />
        <NumberField label="Patrimonio liquido" value={form.equity} onChange={(equity) => setForm({ ...form, equity })} />
        <NumberField label="Lucro liquido" value={form.netIncome} onChange={(netIncome) => setForm({ ...form, netIncome })} />
        <NumberField label="Receita liquida" value={form.revenue} onChange={(revenue) => setForm({ ...form, revenue })} />
        <NumberField label="Ativo total" value={form.assets} onChange={(assets) => setForm({ ...form, assets })} />
      </div>
      <ResultGrid items={[['Liquidez corrente', currentRatio.toFixed(2)], ['Endividamento / PL', debtToEquity.toFixed(2)], ['Margem liquida', formatPercent(netMargin)], ['ROA', formatPercent(roa)]]} />
    </CalculatorCard>
  );
}

function CalculatorCard({ title, summary, onSave, children }: { title: string; summary: string; onSave: (summary: string) => void; children: React.ReactNode }) {
  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{summary}</p>
        </div>
        <Button type="button" onClick={() => onSave(summary)} className="shrink-0">
          <Save size={17} />Salvar
        </Button>
      </div>
      <div className="grid gap-4">{children}</div>
    </Card>
  );
}

function SafetyNote() {
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-900/20 dark:text-amber-100">
      Uso educacional. Confira prescricao, protocolo institucional, concentracao, unidade e orientacao profissional antes de qualquer aplicacao real.
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <Field label={label}>
      <input className={inputClass} type="number" step="0.01" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </Field>
  );
}

function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <Field label={label}>
      <textarea className={inputClass} rows={4} value={value} onChange={(event) => onChange(event.target.value)} />
    </Field>
  );
}

function ResultGrid({ items }: { items: [string, string][] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-md bg-slate-50 px-3 py-3 dark:bg-slate-800">
          <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-1 break-words text-lg font-bold">{value}</p>
        </div>
      ))}
    </div>
  );
}

function parseNumberList(value: string) {
  return value
    .split(/[\s,;]+/)
    .map((item) => Number(item.replace(',', '.')))
    .filter((item) => Number.isFinite(item));
}

function countLines(value: string) {
  return value.split(/\n|,/).map((item) => item.trim()).filter(Boolean).length;
}

function parseJson(value: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(value) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'JSON invalido' };
  }
}

function safeRatio(value: number, divisor: number) {
  return divisor === 0 ? 0 : value / divisor;
}

function calculate(left: number, right: number, operator: string) {
  if (operator === '+') return left + right;
  if (operator === '-') return left - right;
  if (operator === '*') return left * right;
  if (operator === '/') return right === 0 ? 0 : left / right;
  return right;
}

function formatBasicNumber(value: number) {
  if (!Number.isFinite(value)) return '0';
  const rounded = Number(value.toFixed(10));
  return rounded.toString();
}

function formatMoney(value: number) {
  return money.format(Number.isFinite(value) ? value : 0);
}

function formatPercent(value: number) {
  return percent.format(Number.isFinite(value) ? value : 0);
}
