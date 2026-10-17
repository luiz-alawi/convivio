import type { AdminUser, CompanyStatus } from '@convivio/shared';
import { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { Avatar, Badge, Button, Card, Empty, ErrorState, Loading, Segmented } from '@/components';
import { useAdminUpdateUser, useAdminUsers } from '@/hooks/queries';
import { companyStatusLabels, formatCnpj, timeAgo } from '@/lib/labels';
import { colors, font, pillarTheme, spacing } from '@/theme';

const statusOptions = [
  { value: 'pendente', label: 'Pendentes', icon: 'time-outline' },
  { value: 'aprovada', label: 'Aprovadas', icon: 'checkmark-circle-outline' },
  { value: 'recusada', label: 'Recusadas', icon: 'close-circle-outline' },
] as const;

const statusColor: Record<CompanyStatus, string> = {
  pendente: colors.warning,
  aprovada: colors.success,
  recusada: colors.danger,
};

export default function AdminCompanies() {
  const [status, setStatus] = useState<CompanyStatus>('pendente');
  const companies = useAdminUsers({ role: 'empresa', companyStatus: status });
  const update = useAdminUpdateUser();

  const setCompanyStatus = (company: AdminUser, companyStatus: CompanyStatus) => {
    const verb = companyStatus === 'aprovada' ? 'Aprovar' : 'Recusar';
    Alert.alert(`${verb} empresa`, `${verb} "${company.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: verb, style: companyStatus === 'recusada' ? 'destructive' : 'default', onPress: () => update.mutate({ id: company.id, companyStatus }) },
    ]);
  };

  return (
    <FlatList
      data={companies.data}
      keyExtractor={(c) => c.id}
      contentContainerStyle={styles.list}
      refreshing={companies.isRefetching}
      onRefresh={companies.refetch}
      ListHeaderComponent={<Segmented options={statusOptions} value={status} onChange={setStatus} />}
      ListEmptyComponent={
        companies.isLoading ? (
          <Loading />
        ) : companies.error ? (
          <ErrorState error={companies.error} onRetry={companies.refetch} />
        ) : (
          <Empty message="Nenhuma empresa aqui." icon="business-outline" />
        )
      }
      renderItem={({ item }) => (
        <Card>
          <View style={styles.row}>
            <Avatar name={item.name} size={46} gradient={pillarTheme.trabalho.gradient} />
            <View style={styles.flex}>
              <Text style={font.heading}>{item.name}</Text>
              <Text style={font.caption}>cadastrada há {timeAgo(item.createdAt)}</Text>
            </View>
            {item.company && (
              <Badge label={companyStatusLabels[item.company.status].toUpperCase()} color={statusColor[item.company.status]} />
            )}
          </View>
          {item.company && <Info label="CNPJ" value={formatCnpj(item.company.cnpj)} />}
          <Info label="E-mail" value={item.email} />
          {!!item.phone && <Info label="Telefone" value={item.phone} />}
          {!!item.company?.city && <Info label="Cidade" value={item.company.city} />}
          {!!item.company?.website && <Info label="Site" value={item.company.website} />}
          {!!item.company?.description && <Text style={font.body}>{item.company.description}</Text>}
          {item.blocked && <Badge label="BLOQUEADA" color={colors.danger} icon="lock-closed" />}
          <View style={styles.actions}>
            {item.company?.status !== 'recusada' && (
              <Button title="Recusar" size="sm" variant="soft" color={colors.danger} icon="close" onPress={() => setCompanyStatus(item, 'recusada')} style={styles.flex} />
            )}
            {item.company?.status !== 'aprovada' && (
              <Button title="Aprovar" size="sm" color={colors.success} icon="checkmark" onPress={() => setCompanyStatus(item, 'aprovada')} style={styles.flex} />
            )}
          </View>
        </Card>
      )}
    />
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.info}>
      <Text style={[font.caption, styles.infoLabel]}>{label}</Text>
      <Text style={[font.bodyStrong, styles.flex]} selectable>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xs },
  info: { flexDirection: 'row', gap: spacing.md },
  infoLabel: { width: 70 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
});
