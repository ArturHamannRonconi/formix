import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface RemoveMemberModalProps {
  memberName: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function RemoveMemberModal({ memberName, loading, onConfirm, onCancel }: RemoveMemberModalProps) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remover membro</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja remover{' '}
            <span className="font-semibold text-foreground">{memberName}</span> da organização?
            Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? 'Removendo...' : 'Remover'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
