import { Column, Entity, PrimaryColumn } from "typeorm";
import { type Character } from "../../harness/character";

@Entity("characters")
export class CharacterEntity {
  @PrimaryColumn("text")
  id!: string;

  @Column("jsonb")
  data!: Character;
}
