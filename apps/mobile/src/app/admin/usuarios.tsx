import type { AccountRole, AdminUser } from '@convivio/shared';
import { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { Avatar, Badge, Button, Card, Chips, Empty, ErrorState, Loading, TextField } from '@/components';
import { useAdminUpdateUser, useAdminUsers, useMe } from '@/hooks/queries';
import { accountRoleLabels, profileLabels, toOptions } from '@/lib/labels';
import { colors, font, spacing } from '@/theme';

const roleOptions = toOptions(accountRoleLabels);
const roleColor: Record<AccountRole, string> = { usuario: colors.primary, empresa: '#E5484D', admin: '#0F766E' };

export default function AdminUsers() {
  const me = useMe();
  const [role, setRole] = useState<AccountRole>();
  const [search, setSearch] = useState('');
  const users = useAdminUsers({ role, search: search.trim() || undefined });
  const update = useAdminUpdateUser();

  const toggleBlock = (user: AdminUser) =>
    Alert.alert(user.blocked ? 'Desbloquear conta' : 'Bloquear conta', user.name, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: user.blocked ? 'Desbloquear' : 'Bloquear',
        style: user.blocked ? 'default' : 'destructive',
        onPress: () => update.mutate({ id: user.id, blocked: !user.blocked }, { onError: (e) => Alert.alert('Erro', e.message) }),
      },
    ]);

  const changeRole = (user: AdminUser) =>
    Alert.alert('Tipo de conta', `Mudar o tipo de conta de ${user.name}`, [
      ...(['usuario', 'admin'] as const)
        .filter((r) => r !== user.role)
        .map((r) => ({
          text: `Tornar ${accountRoleLabels[r].toLowerCase()}`,
          onPress: () => update.mutate({ id: user.id, role: r }, { onError: (e: Error) => Alert.alert('Erro', e.message) }),
        })),
      { text: 'Cancelar', style: 'cancel' as const },
    ]);

  return (
    <FlatList
      data={users.data}
      keyExtractor={(u) => u.id}
      contentContainerStyle={styles.list}
      keyboardShouldPersistTaps="handled"
      refreshing={users.isRefetching}
      onRefresh={users.refetch}
      ListHeaderComponent={
        <View style={styles.header}>
          <TextField label="Buscar" placeholder="Nome, e-mail ou @usuário" value={search} onChangeText={setSearch} autoCapitalize="none" />
          <Chips options={roleOptions} value={role} onChange={setRole} allowAll />
        </View>
      }
      ListEmptyComponent={
        users.isLoading ? (
          <Loading />
        ) : users.error ? (
          <ErrorState error={users.error} onRetry={users.refetch} />
        ) : (
          <Empty message="Ninguém encontrado." icon="people-outline" />
        )
      }
      renderItem={({ item }) => {
        const isMe = item.id === me.data?.id;
        return (
          <Card>
            <View style={styles.row}>
              <Avatar name={item.name} uri={item.avatarUrl} size={46} />
              <View style={styles.flex}>
                <Text style={font.heading}>
                  {item.name}
                  {isMe ? ' (você)' : ''}
                </Text>
                <Text style={font.caption} selectable>
                  {item.email}
                  {item.username ? ` · @${item.username}` : ''}
                </Text>
              </View>
            </View>
            <View style={styles.badges}>
              <Badge label={accountRoleLabels[item.role].toUpperCase()} color={roleColor[item.role]} />
              {item.profile && <Badge label={profileLabels[item.profile]} color={colors.textMuted} />}
              {item.blocked && <Badge label="BLOQUEADA" color={colors.danger} icon="lock-closed" solid />}
            </View>
            {!isMe && (
              <View style={styles.actions}>
                {item.role !== 'empresa' && (
                  <Button title="Tipo de conta" size="sm" variant="soft" icon="swap-horizontal" onPress={() => changeRole(item)} style={styles.flex} />
                )}
                <Button
                  title={item.blocked ? 'Desbloquear' : 'Bloquear'}
                  size="sm"
                  variant="soft"
                  color={item.blocked ? colors.success : colors.danger}
                  icon={item.blocked ? 'lock-open' : 'lock-closed'}
                  onPress={() => toggleBlock(item)}
                  style={styles.flex}
                />
              </View>
            )}
          </Card>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  header: { gap: spacing.md },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
});
