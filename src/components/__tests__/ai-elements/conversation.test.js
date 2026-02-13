import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  Conversation,
  ConversationContent,
} from "../../ai-elements/conversation.jsx";

describe("Conversation", () => {
  it("renders conversation container and children", () => {
    render(
      <Conversation>
        <ConversationContent>
          <div>Msg A</div>
          <div>Msg B</div>
        </ConversationContent>
      </Conversation>,
    );
    expect(screen.getByTestId("conversation")).toBeInTheDocument();
    expect(screen.getByText("Msg A")).toBeInTheDocument();
    expect(screen.getByText("Msg B")).toBeInTheDocument();
  });
});
