import React from "react";
import { TextInputProps } from "react-native";
import { Container } from "./styles";

type props = TextInputProps;

export const Input = ({ ...res }: props) => {
  return <Container {...res} />;
};
