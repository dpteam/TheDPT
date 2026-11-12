entity DPT is
end entity;

architecture rtl of DPT is
begin
  -- печатает DPT в симуляторе
  process
  begin
    report "DPT" severity note;
    wait;
  end process;
end architecture;
