import { ExternalLink, Database } from 'lucide-react';

function Section({ title, children }) {
  return (
    <div className="card mb-6">
      <h2 className="text-base font-semibold text-slate-800 mb-3 pb-2 border-b border-slate-100">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Tech({ name, role }) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      <span className="mt-0.5 text-teal-500 text-xs font-mono">▸</span>
      <p className="text-sm text-slate-700"><strong>{name}</strong> — {role}</p>
    </div>
  );
}

function Formula({ tex, desc }) {
  return (
    <div className="border border-slate-100 rounded-lg px-4 py-3 bg-slate-50 mb-3">
      <p className="font-mono text-sm text-slate-700 mb-1">{tex}</p>
      <p className="text-xs text-slate-500">{desc}</p>
    </div>
  );
}

export default function About() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">About & Methodology</h1>
        <p className="text-slate-500 text-sm mt-1">
          Project objective, dataset, mathematical methods, and technology stack
        </p>
      </div>

      <Section title="Project Objective">
        <p className="text-sm text-slate-600 leading-relaxed">
          <strong>Rainfall Variation and Seasonal Patterns</strong> is a full-stack data analytics application
          built as a college mini-project for the <em>Mathematical Foundation for GenAI</em> subject.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed mt-3">
          The application analyses 115 years of Indian rainfall data (1901–2015) from 36 meteorological
          subdivisions, enabling exploration of:
        </p>
        <ul className="list-disc list-inside text-sm text-slate-600 mt-2 space-y-1 ml-2">
          <li>Year-to-year rainfall variations</li>
          <li>Monthly and seasonal rainfall patterns</li>
          <li>Regional rainfall differences across Indian subdivisions</li>
          <li>Comparison of any two years against the historical mean</li>
          <li>Descriptive statistical summaries (mean, median, std dev, CV, etc.)</li>
        </ul>
      </Section>

      <Section title="Dataset">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100 mb-4">
          <Database size={20} className="text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Rainfall in India 1901–2015</p>
            <p className="text-xs text-blue-700 mt-0.5">
              India Meteorological Department (IMD) via Open Government Data Platform India
            </p>
            <a href="https://www.data.gov.in/catalog/rainfall-india"
               target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-1 text-xs text-blue-600 underline mt-1">
              data.gov.in/catalog/rainfall-india <ExternalLink size={11} />
            </a>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          {[
            ['Format',     'CSV'],
            ['Records',    '~4,115 rows'],
            ['Subdivisions','36 IMD regions'],
            ['Period',     '1901–2015'],
            ['Unit',       'Millimetres (mm)'],
            ['License',    'NDSAP (Open)'],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-slate-100 px-3 py-2">
              <p className="text-xs text-slate-400 font-medium">{k}</p>
              <p className="text-slate-700 font-medium">{v}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-4 leading-relaxed">
          <strong>Columns:</strong> SUBDIVISION, YEAR, JAN, FEB, MAR, APR, MAY, JUN, JUL, AUG, SEP, OCT,
          NOV, DEC, ANNUAL, Jan-Feb, Mar-May, Jun-Sep, Oct-Dec.
          Missing values are represented as empty cells and are excluded from calculations.
        </p>
      </Section>

      <Section title="Mathematical Methodology">
        <p className="text-xs text-slate-500 mb-3">
          All statistics use the <em>population</em> formula (dividing by n) since the dataset
          covers the full historical record, not a drawn sample.
        </p>
        <Formula tex="μ = Σxᵢ / n"             desc="Arithmetic mean — sum of observations divided by count" />
        <Formula tex="Median = x[(n+1)/2]"       desc="Middle value of the sorted dataset; average of two middle values for even n" />
        <Formula tex="Range = Max − Min"          desc="Spread between highest and lowest observation" />
        <Formula tex="σ² = Σ(xᵢ − μ)² / n"     desc="Population variance — average squared deviation from the mean" />
        <Formula tex="σ = √σ²"                    desc="Population standard deviation — in the same unit as rainfall (mm)" />
        <Formula tex="CV = (σ / μ) × 100"        desc="Coefficient of variation (%) — relative variability; undefined when μ = 0" />
        <Formula tex="Δ% = ((curr − prev) / prev) × 100"
                 desc="Year-to-year percentage change; undefined when previous value is 0" />
        <Formula tex="Contrib% = (seasonal / annual) × 100"
                 desc="Seasonal contribution to annual rainfall" />
      </Section>

      <Section title="Season Definitions">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {[
            ['❄️ Winter',        'January – February',                      'Western disturbance rainfall in northern India'],
            ['🌤 Pre-Monsoon',   'March – May',                             'Hot and dry period; scattered thunderstorms'],
            ['🌧 SW Monsoon',    'June – September',                        'Primary monsoon; ~70–80% of India\'s annual rainfall'],
            ['🌦 Post-Monsoon',  'October – December',                      'North-east monsoon; affects Tamil Nadu & Andhra Pradesh'],
          ].map(([name, months, desc]) => (
            <div key={name} className="rounded-xl border border-slate-200 p-3">
              <p className="font-semibold text-slate-700">{name}</p>
              <p className="text-xs text-teal-600 font-medium mt-0.5">{months}</p>
              <p className="text-xs text-slate-500 mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Technology Stack">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Frontend</p>
            <Tech name="React 18"        role="UI component framework" />
            <Tech name="Vite 6"          role="Build tool and dev server" />
            <Tech name="Tailwind CSS 3"  role="Utility-first styling" />
            <Tech name="React Router 6"  role="Client-side routing" />
            <Tech name="Recharts"        role="SVG-based data visualisation" />
            <Tech name="Lucide React"    role="Icon library" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Backend</p>
            <Tech name="Java 21"         role="Runtime language" />
            <Tech name="Spring Boot 3.3" role="REST API framework" />
            <Tech name="Apache Commons CSV" role="CSV parsing" />
            <Tech name="Maven 3.9"       role="Build and dependency management" />
            <Tech name="JUnit 5"         role="Unit testing framework" />
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-4">
          No database required — data is loaded from CSV into memory at startup.
          No AI/ML models — analysis is entirely descriptive statistics.
        </p>
      </Section>

      <Section title="Known Limitations">
        <ul className="list-disc list-inside text-sm text-slate-600 space-y-1.5 ml-1">
          <li>The dataset ends at 2015; recent years are not included.</li>
          <li>Some year-subdivision combinations have missing values and are excluded from calculations.</li>
          <li>This application provides <strong>descriptive analysis only</strong> — it does not make causal or predictive claims.</li>
          <li>Seasonal labels follow IMD conventions; different meteorological bodies may use different definitions.</li>
          <li>Regional analysis is at the IMD subdivision level; district-level data is not included.</li>
        </ul>
      </Section>

      <Section title="References">
        <div className="space-y-2 text-sm">
          {[
            ['India Meteorological Department — data.gov.in', 'https://www.data.gov.in/catalog/rainfall-india'],
            ['National Data Sharing and Accessibility Policy (NDSAP)', 'https://data.gov.in/sites/default/files/NDSAP.pdf'],
            ['Spring Boot Documentation', 'https://docs.spring.io/spring-boot/docs/current/reference/html/'],
            ['Recharts Documentation', 'https://recharts.org/en-US/'],
            ['Apache Commons CSV', 'https://commons.apache.org/proper/commons-csv/'],
          ].map(([label, url]) => (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-2 text-teal-600 hover:text-teal-700 transition-colors">
              <ExternalLink size={13} />
              {label}
            </a>
          ))}
        </div>
      </Section>
    </div>
  );
}
