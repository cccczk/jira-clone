import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select";
export default function Home() {
  return (
    <div className="flex gap-4">
      <Input></Input>
      <Select>111</Select>
      <Button size="lg">primary</Button>
      <Button variant="secondary">second</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="ghost">ghost</Button>
      <Button variant="muted">muted</Button>
      <Button variant="outline">outline</Button>
      <Button variant="teritary">teritary</Button>
      
    </div>
  );
}
