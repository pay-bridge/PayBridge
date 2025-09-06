import Pricing from '@/components/ui/Pricing/Pricing';
import { createClient } from '@/core/users/supabase/server';
import {
  getProducts,
  getSubscription,
  getUser
} from '@/core/users/supabase/queries';

export default async function PricingPage() {
  const supabase = createClient();
  const [user, products, subscription] = await Promise.all([
    getUser(supabase),
    getProducts(supabase),
    getSubscription(supabase)
  ]);

  return (
    <Pricing
      user={user}
      products={products ?? []}
      subscription={subscription}
    />
  );
}
