import { useMemo, useState } from 'react'
import './App.css'

type Status =
  | 'Ny forespørsel'
  | 'Tilbud sendt'
  | 'Vunnet'
  | 'Tapt'

type Sak = {
  id: number
  kundenr: string
  kunde: string
  kontakt: string
  prosjekt: string
  prosjektleder: string
  foresporsel: string
  svarfrist: string
  tilbud: number
  status: Status
  forsendelsesdato?: string
  underlagSendes?: string
  underlagSvarfrist?: string
  underlagGodkjent?: boolean
  malertrafoer?: 'Ja' | 'Nei'
  bestiltSkilt?: boolean
  produksjonsunderlag?: boolean
}

const startData: Sak[] = [
  {
    id: 1,
    kundenr: '10021',
    kunde: 'Eksempelkunde AS',
    kontakt: 'Ola Nordmann',
    prosjekt: 'Hovedtavle bygg A',
    prosjektleder: 'Stian Hansen',
    foresporsel: '2026-11-02',
    svarfrist: '2026-11-12',
    tilbud: 185000,
    status: 'Tilbud sendt',
  },
  {
    id: 2,
    kundenr: '10034',
    kunde: 'Demo Elektro AS',
    kontakt: 'Kari Hansen',
    prosjekt: 'Fordelingstavler',
    prosjektleder: 'Stian Hansen',
    foresporsel: '2026-10-20',
    svarfrist: '2026-10-30',
    tilbud: 320000,
    status: 'Vunnet',
    forsendelsesdato: '2026-12-15',
    underlagSendes: '2026-11-10',
    underlagSvarfrist: '2026-11-17',
    underlagGodkjent: false,
    malertrafoer: 'Ja',
    bestiltSkilt: false,
    produksjonsunderlag: false,
  },
]

function App() {
  const [saker, setSaker] = useState<Sak[]>(startData)
  const [visning, setVisning] =
    useState<'tilbud' | 'ordre'>('tilbud')
  const [sok, setSok] = useState('')

  const valuta = (belop: number) =>
    new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      maximumFractionDigits: 0,
    }).format(belop)

  const stats = useMemo(() => {
    const vunnet = saker.filter(
      (sak) => sak.status === 'Vunnet'
    )

    const tapt = saker.filter(
      (sak) => sak.status === 'Tapt'
    )

    const aktive = saker.filter(
      (sak) =>
        sak.status !== 'Vunnet' &&
        sak.status !== 'Tapt'
    )

    const avsluttede = vunnet.length + tapt.length

    return {
      aktive: aktive.length,

      tilbudsverdi: aktive.reduce(
        (sum, sak) => sum + sak.tilbud,
        0
      ),

      ordreverdi: vunnet.reduce(
        (sum, sak) => sum + sak.tilbud,
        0
      ),

      hitrate:
        avsluttede > 0
          ? Math.round(
              (vunnet.length / avsluttede) * 100
            )
          : 0,
    }
  }, [saker])

  const oppdater = (
    id: number,
    felt: keyof Sak,
    verdi: any
  ) => {
    setSaker((gamle) =>
      gamle.map((sak) =>
        sak.id === id
          ? {
              ...sak,
              [felt]: verdi,
            }
          : sak
      )
    )
  }

  const endreStatus = (
    id: number,
    status: Status
  ) => {
    setSaker((gamle) =>
      gamle.map((sak) => {
        if (sak.id !== id) {
          return sak
        }

        if (status === 'Vunnet') {
          return {
            ...sak,
            status: 'Vunnet',
            forsendelsesdato:
              sak.forsendelsesdato || '',
            underlagSendes:
              sak.underlagSendes || '',
            underlagSvarfrist:
              sak.underlagSvarfrist || '',
            underlagGodkjent:
              sak.underlagGodkjent || false,
            malertrafoer:
              sak.malertrafoer || 'Nei',
            bestiltSkilt:
              sak.bestiltSkilt || false,
            produksjonsunderlag:
              sak.produksjonsunderlag || false,
          }
        }

        return {
          ...sak,
          status,
        }
      })
    )

    if (status === 'Vunnet') {
      setVisning('ordre')
    }
  }

  const nyForesporsel = () => {
    const ny: Sak = {
      id: Date.now(),
      kundenr: '',
      kunde: 'Ny kunde',
      kontakt: '',
      prosjekt: 'Nytt prosjekt',
      prosjektleder: 'Stian Hansen',
      foresporsel: new Date()
        .toISOString()
        .slice(0, 10),
      svarfrist: '',
      tilbud: 0,
      status: 'Ny forespørsel',
    }

    setSaker((gamle) => [ny, ...gamle])
    setVisning('tilbud')
  }

  const grunnlag =
    visning === 'ordre'
      ? saker.filter(
          (sak) => sak.status === 'Vunnet'
        )
      : saker.filter(
          (sak) => sak.status !== 'Vunnet'
        )

  const visteSaker = grunnlag.filter(
    (sak) =>
      `${sak.kundenr} ${sak.kunde} ${sak.kontakt} ${sak.prosjekt} ${sak.prosjektleder}`
        .toLowerCase()
        .includes(sok.toLowerCase())
  )

  return (
    <div className="app">
      <header className="header">
        <div>
          <div className="eyebrow">
            SALGS- OG ORDREOVERSIKT
          </div>

          <h1>Ordre, tilbud og hitrate</h1>

          <p>
            Fra kundeforespørsel til
            produksjonsklar ordre.
          </p>
        </div>

        <button
          className="primary"
          onClick={nyForesporsel}
        >
          + Ny forespørsel
        </button>
      </header>

      <main>
        <section className="dashboard">
          <StatCard
            tittel="Aktive tilbud"
            verdi={String(stats.aktive)}
          />

          <StatCard
            tittel="Aktiv tilbudsverdi"
            verdi={valuta(stats.tilbudsverdi)}
          />

          <StatCard
            tittel="Ordreverdi"
            verdi={valuta(stats.ordreverdi)}
          />

          <StatCard
            tittel="Hitrate"
            verdi={`${stats.hitrate} %`}
          />
        </section>

        <div className="toolbar">
          <div className="tabs">
            <button
              className={
                visning === 'tilbud'
                  ? 'tab active'
                  : 'tab'
              }
              onClick={() =>
                setVisning('tilbud')
              }
            >
              Tilbud
            </button>

            <button
              className={
                visning === 'ordre'
                  ? 'tab active'
                  : 'tab'
              }
              onClick={() =>
                setVisning('ordre')
              }
            >
              Ordre (
              {
                saker.filter(
                  (sak) =>
                    sak.status === 'Vunnet'
                ).length
              }
              )
            </button>
          </div>

          <input
            className="search"
            placeholder="Søk kunde, prosjekt eller prosjektleder"
            value={sok}
            onChange={(e) =>
              setSok(e.target.value)
            }
          />
        </div>

        {visning === 'tilbud' ? (
          <section className="panel">
            <h2>Tilbud og forespørsler</h2>

            <p className="subtitle">
              Endre status til Vunnet for å
              flytte saken til ordre.
            </p>

            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>Kundenr.</th>
                    <th>Kunde</th>
                    <th>Prosjekt</th>
                    <th>Prosjektleder</th>
                    <th>Forespørsel</th>
                    <th>Svarfrist</th>
                    <th>Verdi</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {visteSaker.map((sak) => (
                    <tr key={sak.id}>
                      <td>
                        {sak.kundenr || '–'}
                      </td>

                      <td>
                        <strong>
                          {sak.kunde}
                        </strong>

                        <small>
                          {sak.kontakt ||
                            'Ingen kontakt'}
                        </small>
                      </td>

                      <td>
                        {sak.prosjekt}
                      </td>

                      <td>
                        {sak.prosjektleder}
                      </td>

                      <td>
                        {sak.foresporsel}
                      </td>

                      <td>
                        {sak.svarfrist || '–'}
                      </td>

                      <td>
                        {valuta(sak.tilbud)}
                      </td>

                      <td>
                        <select
                          value={sak.status}
                          onChange={(e) =>
                            endreStatus(
                              sak.id,
                              e.target
                                .value as Status
                            )
                          }
                        >
                          <option>
                            Ny forespørsel
                          </option>

                          <option>
                            Tilbud sendt
                          </option>

                          <option>
                            Vunnet
                          </option>

                  <option>
                            Tapt
                          </option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <section>
            <div className="sectionHeading">
              <h2>
                Ordre og
                produksjonsoppfølging
              </h2>

              <p>
                Vunne tilbud ligger her frem
                til levering.
              </p>
            </div>

            <div className="orders">
              {visteSaker.map((sak) => (
                <article
                  key={sak.id}
                  className="orderCard"
                >
                  <div className="orderTop">
                    <div>
                      <h3>
                        {sak.kunde} ·{' '}
                        {sak.prosjekt}
                      </h3>

                      <p>
                        Kunde{' '}
                        {sak.kundenr || '–'} ·
                        Prosjektleder:{' '}
                        {sak.prosjektleder} ·
                        Ordreverdi:{' '}
                        {valuta(sak.tilbud)}
                      </p>
                    </div>

                    <span className="orderBadge">
                      ORDRE
                    </span>
                  </div>

                  <div className="dates">
                    <DateField
                      label="Forsendelsesdato"
                      value={
                        sak.forsendelsesdato
                      }
                      onChange={(verdi) =>
                        oppdater(
                          sak.id,
                          'forsendelsesdato',
                          verdi
                        )
                      }
                    />

                    <DateField
                      label="Underlag sendes til kunde"
                      value={
                        sak.underlagSendes
                      }
                      onChange={(verdi) =>
                        oppdater(
                          sak.id,
                          'underlagSendes',
                          verdi
                        )
                      }
                    />

                    <DateField
                      label="Svarfrist underlag fra kunde"
                      value={
                        sak.underlagSvarfrist
                      }
                      onChange={(verdi) =>
                        oppdater(
                          sak.id,
                          'underlagSvarfrist',
                          verdi
                        )
                      }
                    />
                  </div>

                  <div className="checks">
                    <h4>SJEKKPUNKTER</h4>

                    <div className="checkGrid">
                      <Check
                        label="Underlag godkjent"
                        checked={
                          !!sak.underlagGodkjent
                        }
                        onChange={(verdi) =>
                          oppdater(
                            sak.id,
                            'underlagGodkjent',
                            verdi
                          )
                        }
                      />

                      <label>
                        Målertrafoer

                        <select
                          value={
                            sak.malertrafoer ||
                            'Nei'
                          }
                          onChange={(e) =>
                            oppdater(
                              sak.id,
                              'malertrafoer',
                              e.target.value
                            )
                          }
                        >
                          <option value="Ja">
                            Ja
                          </option>

                          <option value="Nei">
                            Nei
                          </option>
                        </select>
                      </label>

                      <Check
                        label="Bestilt skilt"
                        checked={
                          !!sak.bestiltSkilt
                        }
                        onChange={(verdi) =>
                          oppdater(
                            sak.id,
                            'bestiltSkilt',
                            verdi
                          )
                        }
                      />

                      <Check
                        label="Produksjonsunderlag"
                        checked={
                          !!sak.produksjonsunderlag
                        }
                        onChange={(verdi) =>
                          oppdater(
                            sak.id,
                            'produksjonsunderlag',
                            verdi
                          )
                        }
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

function StatCard({
  tittel,
  verdi,
}: {
  tittel: string
  verdi: string
}) {
  return (
    <div className="statCard">
      <span>{tittel}</span>
      <strong>{verdi}</strong>
    </div>
  )
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string
  value?: string
  onChange: (value: string) => void
}) {
  return (
    <label>
      {label}

      <input
        type="date"
        value={value || ''}
        onChange={(e) =>
          onChange(e.target.value)
        }
      />
    </label>
  )
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="check">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) =>
          onChange(e.target.checked)
        }
      />

      {label}
    </label>
  )
}

export default App