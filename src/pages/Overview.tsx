import { AppLayout } from '@/components/layout/AppLayout';

export default function Overview() {
  return (
    <AppLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold">System Test</h1>
        <p className="text-green-500">If you can see this, the App is working. The blank screen was caused by missing data hooks.</p>
      </div>
    </AppLayout>
  );
}
