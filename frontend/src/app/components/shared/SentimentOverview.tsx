import { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { publicApi } from '../../api';
import { Skeleton } from '../ui/skeleton (1)';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip (1)';

interface SentimentOverviewProps {
  institutionId: string;
  institutionName: string;
}

interface SentimentGroup {
  positive: number;
  neutral: number;
  negative: number;
}

interface SentimentOverviewResponse {
  userGenerated: SentimentGroup;
  scraped: SentimentGroup;
  combined: SentimentGroup;
}

function getPercentage(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function PercentageLabel({ x, y, width, height, value, payload }: any) {
  const total = payload?.total ?? 1;
  const count = Number(value ?? 0);

  if (!count) return null;

  const pct = getPercentage(count, total);
  const labelX = Number(x ?? 0) + Number(width ?? 0) - 8;
  const labelY = Number(y ?? 0) + Number(height ?? 0) / 2;

  return (
    <text
      x={labelX}
      y={labelY}
      fill="white"
      textAnchor="end"
      dominantBaseline="middle"
      fontSize={11}
      fontWeight={600}
    >
      {pct}%
    </text>
  );
}

function SentimentChart({
  title,
  description,
  data,
  showEmptyState = false,
  emptyMessage,
}: {
  title?: string;
  description?: string;
  data: SentimentGroup | null;
  showEmptyState?: boolean;
  emptyMessage?: string;
}) {
  if (showEmptyState) {
    return (
      <div className="rounded-xl border border-dashed border-[#DEDEDE] bg-[#FAFAF8] p-6 text-center">
        <p className="text-[13px] text-[#5F5E5A]">{emptyMessage}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-28 w-full rounded-lg" />
      </div>
    );
  }

  const total = data.positive + data.neutral + data.negative;
  const chartData = [{
    name: 'sentiment',
    positive: data.positive,
    neutral: data.neutral,
    negative: data.negative,
    total,
  }];

  return (
    <div>
      {title ? (
        <div className="mb-3">
          <h4 className="text-[14px] font-medium text-[#1A1A1A]">{title}</h4>
          {description && <p className="mt-1 text-[12px] text-[#5F5E5A]">{description}</p>}
        </div>
      ) : null}
      <div className="h-40 rounded-lg border border-[#EFECE7] bg-[#FCFCFB] p-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" barGap={0} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid horizontal={false} stroke="#EFECE7" />
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" hide />
            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="rect"
              formatter={(value: string) => <span className="text-[11px] text-[#5F5E5A]">{value}</span>}
            />
            <Bar dataKey="positive" name="Positive" stackId="a" fill="#16A34A" radius={[0, 4, 4, 0]} maxBarSize={24}>
              <LabelList content={<PercentageLabel />} />
            </Bar>
            <Bar dataKey="neutral" name="Neutral" stackId="a" fill="#9CA3AF" radius={[0, 4, 4, 0]} maxBarSize={24}>
              <LabelList content={<PercentageLabel />} />
            </Bar>
            <Bar dataKey="negative" name="Critical" stackId="a" fill="#DC2626" radius={[0, 4, 4, 0]} maxBarSize={24}>
              <LabelList content={<PercentageLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex items-center justify-between text-[12px] text-[#5F5E5A]">
        <span>{data.positive} positive</span>
        <span>{data.neutral} neutral</span>
        <span>{data.negative} critical</span>
      </div>
    </div>
  );
}

export function SentimentOverview({ institutionId, institutionName }: SentimentOverviewProps) {
  const [data, setData] = useState<SentimentOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!institutionId) return;

    let isMounted = true;
    setLoading(true);

    publicApi.getInstitutionSentimentOverview(institutionId)
      .then((response) => {
        if (isMounted) {
          setData(response.data.data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setData(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [institutionId]);

  return (
    <section className="mb-6 rounded-xl border border-[#DEDEDE] bg-white p-5">
      <div className="mb-4">
        <h3 className="text-[15px] font-medium text-[#1A1A1A]">Sentiment overview</h3>
        <p className="mt-1 text-[13px] text-[#5F5E5A]">How {institutionName} is being discussed across peer responses and public sources.</p>
      </div>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-[#EFECE7] bg-[#FCFCFB] p-4">
            <Skeleton className="mb-3 h-4 w-32" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
          <div className="rounded-xl border border-[#EFECE7] bg-[#FCFCFB] p-4">
            <Skeleton className="mb-3 h-4 w-32" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-[#EFECE7] bg-[#FCFCFB] p-4">
              <SentimentChart
                title="Peer Responses"
                description="Responses from students and advisors on the platform"
                data={data?.userGenerated ?? null}
              />
            </div>

            <div className="rounded-xl border border-[#EFECE7] bg-[#FCFCFB] p-4">
              <div className="mb-3 flex items-center gap-2">
                <h4 className="text-[14px] font-medium text-[#1A1A1A]">Public Opinions</h4>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="rounded-full p-1 text-[#5F5E5A] transition hover:bg-[#F3F2EE] hover:text-[#1A1A1A]">
                      <Info size={14} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[220px]">
                    Automatically collected from public online sources and classified by our sentiment model. Updated weekly.
                  </TooltipContent>
                </Tooltip>
              </div>
              <SentimentChart
                data={data?.scraped ?? null}
                showEmptyState={Boolean(data && data.scraped && data.scraped.positive === 0 && data.scraped.neutral === 0 && data.scraped.negative === 0)}
                emptyMessage="Public opinion data is being gathered. Check back soon."
              />
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-[#DEDEDE] bg-[#F9F8F4] p-4">
            <div className="mb-3">
              <h4 className="text-[14px] font-medium text-[#1A1A1A]">Combined Sentiment</h4>
              <p className="mt-1 text-[12px] text-[#5F5E5A]">A combined view of both peer and public-source sentiment.</p>
            </div>
            <SentimentChart
              title="Combined Sentiment"
              data={data?.combined ?? null}
            />
          </div>
        </>
      )}
    </section>
  );
}
