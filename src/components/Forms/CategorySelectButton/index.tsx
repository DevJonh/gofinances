import React from "react";
import { RectButtonProps } from "react-native-gesture-handler";
import { Container, Category, Icon } from "./styles";

interface Props extends RectButtonProps {
  title: string;
}

export const CategorySelectButton = ({ title, ...rest }: Props) => {
  return (
    <Container {...rest} activeOpacity={0.7}>
      <Category>{title}</Category>
      <Icon name="chevron-down" />
    </Container>
  );
};
