import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from 'lucide-react';

interface TimeFrameSelectorProps {
  timeFrame: 'week' | 'month' | 'custom';
  onTimeFrameChange: (timeFrame: 'week' | 'month' | 'custom') => void;
  customDates: { start: string; end: string };
  onCustomDatesChange: (dates: { start: string; end: string }) => void;
}

export function TimeFrameSelector({
  timeFrame,
  onTimeFrameChange,
  customDates,
  onCustomDatesChange,
}: TimeFrameSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex rounded-lg overflow-hidden border border-border">
        <Button
          variant={timeFrame === 'week' ? 'default' : 'ghost'}
          size="sm"
          className="rounded-none"
          onClick={() => onTimeFrameChange('week')}
        >
          Week
        </Button>
        <Button
          variant={timeFrame === 'month' ? 'default' : 'ghost'}
          size="sm"
          className="rounded-none border-x border-border"
          onClick={() => onTimeFrameChange('month')}
        >
          Month
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={timeFrame === 'custom' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none"
              onClick={() => onTimeFrameChange('custom')}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Custom
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="end">
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={customDates.start}
                  onChange={(e) => onCustomDatesChange({ ...customDates, start: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={customDates.end}
                  onChange={(e) => onCustomDatesChange({ ...customDates, end: e.target.value })}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
