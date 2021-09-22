import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator } from "react-native";
import { useTheme } from "styled-components";
import { HighlightCard } from "../../components/HighlightCard";
import {
  TransactionCard,
  TransactionCardProps,
} from "../../components/TransactionCard";
import {
  Container,
  Header,
  UserWrapper,
  UserInfo,
  Photo,
  User,
  UserGretting,
  UserName,
  Icon,
  HighlightCards,
  Transactions,
  Title,
  TransactionsList,
  LogoutButton,
  LoadContainer,
} from "./styles";

export interface DataListProps extends TransactionCardProps {
  id: string;
}

interface HighlightProps {
  amount: string;
  lastTransaction: string;
}

interface HighlightCard {
  entries: HighlightProps;
  expenses: HighlightProps;
  total: HighlightProps;
}

export const Dashboard = () => {
  const dataKey = "@gofinances:transactions";
  const [transactions, setTransactions] = useState<DataListProps[]>([]);
  const [highlightData, setHighlightData] = useState<HighlightCard>(
    {} as HighlightCard
  );
  const [isLoading, setIsLoading] = useState(true);

  const theme = useTheme();

  const getLastTransactionData = (
    collections: DataListProps[],
    type: "up" | "down"
  ) => {
    const lastTransactions = new Date(
      Math.max.apply(
        Math,
        collections
          .filter((item) => item.type === type)
          .map((item) => new Date(item.date).getTime())
      )
    );

    return `${lastTransactions.getDate()} de ${lastTransactions.toLocaleString(
      "pt-BR",
      { month: "long" }
    )}`;
  };

  const loadTransactions = async () => {
    const response = await AsyncStorage.getItem(dataKey);
    const transactions = response ? JSON.parse(response) : [];

    let entriesTotal = 0;
    let expenseTotal = 0;

    const transactionsFormated: DataListProps[] = transactions.map(
      (transaction: DataListProps) => {
        if (transaction.type === "up") {
          entriesTotal += Number(transaction.amount);
        } else {
          expenseTotal += Number(transaction.amount);
        }

        const amount = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(Number(transaction.amount));

        const date = new Date(transaction.date).toLocaleDateString("pt-BR");

        return {
          id: transaction.id,
          name: transaction.name,
          amount,
          type: transaction.type,
          category: transaction.category,
          date,
        };
      }
    );

    setTransactions(transactionsFormated);

    const lastTransactionsEntries = getLastTransactionData(transactions, "up");
    const lastTransactionsExpenses = getLastTransactionData(
      transactions,
      "down"
    );
    const totalInterval = `01 até ${lastTransactionsExpenses}`;

    setHighlightData({
      expenses: {
        amount: new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(expenseTotal),
        lastTransaction: `Última saída de ${lastTransactionsExpenses}`,
      },
      entries: {
        amount: new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(entriesTotal),
        lastTransaction: `Última entrada de ${lastTransactionsEntries}`,
      },
      total: {
        amount: new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(entriesTotal - expenseTotal),
        lastTransaction: totalInterval,
      },
    });

    setIsLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  return (
    <Container>
      {isLoading ? (
        <LoadContainer>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </LoadContainer>
      ) : (
        <>
          <Header>
            <UserWrapper>
              <UserInfo>
                <Photo
                  source={{
                    uri: "https://avatars.githubusercontent.com/u/53903172?v=4",
                  }}
                />

                <User>
                  <UserGretting>Olá,</UserGretting>
                  <UserName>Jônatas</UserName>
                </User>
              </UserInfo>
              <LogoutButton onPress={() => {}}>
                <Icon name="power" />
              </LogoutButton>
            </UserWrapper>
          </Header>
          <HighlightCards>
            <HighlightCard
              type="up"
              title="Entradas"
              amount={highlightData.entries.amount}
              lastTransaction={highlightData.entries.lastTransaction}
            />
            <HighlightCard
              type="down"
              title="Saídas"
              amount={highlightData.expenses.amount}
              lastTransaction={highlightData.expenses.lastTransaction}
            />
            <HighlightCard
              type="total"
              title="Total"
              amount={highlightData.total.amount}
              lastTransaction={highlightData.total.lastTransaction}
            />
          </HighlightCards>

          <Transactions>
            <Title>Listagem</Title>

            <TransactionsList
              data={transactions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <TransactionCard data={item} />}
            />
          </Transactions>
        </>
      )}
    </Container>
  );
};
