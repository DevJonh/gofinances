import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useState } from "react";
import { VictoryPie } from "victory-native";
import { useTheme } from "styled-components";
import { addMonths, format, subMonths } from "date-fns";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { HistoryCard } from "../../components/HistoryCard";
import {
  Container,
  Header,
  Title,
  Content,
  ChartContainer,
  MonthSelect,
  MonthSelectButtom,
  SelectIcon,
  Month,
  LoadContainer,
  Info,
  InfoContainer,
} from "./styles";
import { DataListProps } from "../Dashboard";
import { categories } from "../../utils/categories";
import { RFValue } from "react-native-responsive-fontsize";
import { ptBR } from "date-fns/locale";
import { ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/core";
import { useAuth } from "../../hooks/auth";

interface CategoryData {
  name: string;
  total: number;
  totalFormatted: string;
  color: string;
  percent: string;
}

export const Resume = () => {
  const { signOut, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<CategoryData[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const theme = useTheme();

  const handleDateChange = (action: "next" | "back") => {
    if (action === "next") {
      setSelectedDate(addMonths(selectedDate, 1));
    } else {
      setSelectedDate(subMonths(selectedDate, 1));
    }
  };

  const loadData = async () => {
    setIsLoading(true);

    const dataKey = `@gofinances:transactions_user:${user.id}`;
    const response = await AsyncStorage.getItem(dataKey);
    const transactions = response ? JSON.parse(response) : [];

    const expenses = transactions.filter(
      (item: DataListProps) =>
        item.type === "down" &&
        new Date(item.date).getMonth() === selectedDate.getMonth() &&
        new Date(item.date).getFullYear() === selectedDate.getFullYear()
    );

    const expensiveTotal = expenses.reduce(
      (acumulator: number, expense: DataListProps) => {
        return (acumulator += Number(expense.amount));
      },
      0
    );

    const totalByCategory = [];

    categories.forEach((category) => {
      let categorySum = 0;

      expenses.forEach((expense: DataListProps) => {
        if (expense.category === category.key) {
          categorySum += Number(expense.amount);
        }
      });

      if (categorySum > 0) {
        const percent = `${((categorySum / expensiveTotal) * 100).toFixed(0)}%`;

        totalByCategory.push({
          name: category.name,
          totalFormatted: new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(categorySum),
          total: categorySum,
          color: category.color,
          percent,
        });
      }
    });

    setData(totalByCategory);
    setIsLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [selectedDate])
  );

  return (
    <Container>
      <Header>
        <Title>Resumo por categoria</Title>
      </Header>
      {isLoading ? (
        <LoadContainer>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </LoadContainer>
      ) : (
        <Content
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: useBottomTabBarHeight(),
          }}
        >
          <MonthSelect>
            <MonthSelectButtom onPress={() => handleDateChange("back")}>
              <SelectIcon name="chevron-left" />
            </MonthSelectButtom>

            <Month>
              {format(selectedDate, "MMMM, yyyy", { locale: ptBR })}
            </Month>

            <MonthSelectButtom onPress={() => handleDateChange("next")}>
              <SelectIcon name="chevron-right" />
            </MonthSelectButtom>
          </MonthSelect>
          {data.length > 0 ? (
            <>
              <ChartContainer>
                <VictoryPie
                  data={data}
                  x="percent"
                  y="total"
                  colorScale={data.map((category) => category.color)}
                  style={{
                    labels: {
                      fontSize: RFValue(18),
                      fontWeight: "bold",
                      fill: theme.colors.shape,
                    },
                  }}
                  labelRadius={55}
                />
              </ChartContainer>

              {data.map((item) => (
                <HistoryCard
                  key={item.name}
                  title={item.name}
                  amount={item.totalFormatted}
                  color={item.color}
                />
              ))}
            </>
          ) : (
            <InfoContainer>
              <Info>Nenhuma transação</Info>
              <Info>a ser exibida</Info>
            </InfoContainer>
          )}
        </Content>
      )}
    </Container>
  );
};
